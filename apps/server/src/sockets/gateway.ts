import {
  commandAckSchema,
  commandRequestSchema,
  eventEnvelopeSchema,
  schemaVersion,
  type CommandAck,
  type EventEnvelope,
} from "@greenwood/contracts";
import {
  handleJoin,
  handleLeave,
  handleLook,
  handleMove,
  handleSay,
  parsePlayerCommand,
  type EngineRuntime,
  type WorldState,
} from "@greenwood/game-engine";
import type { FastifyInstance } from "fastify";
import { Server, type Socket } from "socket.io";
import {
  COMMAND_RATE_MAX,
  COMMAND_RATE_WINDOW_MS,
  RateLimiter,
  SAY_RATE_MAX,
  SAY_RATE_WINDOW_MS,
} from "../application/rate-limit.js";
import { claimDevCharacter, DEV_START_ROOM_ID } from "../application/session-characters.js";
import { parseCookie, SESSION_COOKIE } from "../auth/cookies.js";
import type { PlayIdentity } from "../auth/service.js";

export type RealtimeOptions = {
  allowGuestPlay?: boolean;
  resolveSession?: (token: string) => Promise<PlayIdentity | undefined>;
  persistRoom?: (characterId: string, roomId: string) => Promise<void>;
};

const defaultAllowedOrigins =
  "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000";

export function allowedOrigins(): string[] {
  const listed = (process.env.ALLOWED_ORIGINS ?? defaultAllowedOrigins)
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  const renderUrl = process.env.RENDER_EXTERNAL_URL?.replace(/\/$/, "");
  if (renderUrl && !listed.includes(renderUrl)) {
    listed.push(renderUrl);
  }
  return listed;
}

export async function attachRealtime(
  app: FastifyInstance,
  world: WorldState,
  options: RealtimeOptions = {},
): Promise<Server> {
  await app.ready();

  const allowGuestPlay = options.allowGuestPlay ?? true;
  const sequences = new Map<string, number>();
  const sockets = new Map<string, Socket>();
  const limiter = new RateLimiter();
  const io = new Server(app.server, {
    cors: {
      origin: allowedOrigins(),
      credentials: true,
    },
  });

  app.addHook("onClose", async () => {
    await io.close();
  });

  io.use((socket, next) => {
    void (async () => {
      try {
        const token = parseCookie(socket.handshake.headers.cookie, SESSION_COOKIE);
        if (token && options.resolveSession) {
          const identity = await options.resolveSession(token);
          if (identity) {
            socket.data.identity = identity;
            next();
            return;
          }
        }
        if (!allowGuestPlay) {
          next(new Error("sign_in_required"));
          return;
        }
        next();
      } catch {
        next(new Error("sign_in_required"));
      }
    })();
  });

  io.on("connection", (socket) => {
    const identity = socket.data.identity as PlayIdentity | undefined;
    const claimed = identity
      ? {
          id: identity.characterId,
          name: identity.characterName,
          roomId: identity.roomId,
        }
      : claimDevCharacter(world);
    if (!claimed) {
      socket.emit(
        "event",
        eventEnvelopeSchema.parse({
          eventId: crypto.randomUUID(),
          sequence: 1,
          schemaVersion,
          type: "system.notice",
          occurredAt: new Date().toISOString(),
          audience: "character",
          narration: "The courtyard cannot hold another student right now.",
          payload: {},
        }),
      );
      socket.disconnect(true);
      return;
    }

    const runtime = commandRuntime(sequences);
    const joined = handleJoin(
      world,
      {
        verb: "join",
        characterId: claimed.id,
        name: claimed.name,
        roomId: "roomId" in claimed ? claimed.roomId : DEV_START_ROOM_ID,
      },
      runtime,
    );
    if (!joined.ok) {
      socket.emit(
        "event",
        eventEnvelopeSchema.parse({
          eventId: crypto.randomUUID(),
          sequence: 1,
          schemaVersion,
          type: "system.notice",
          occurredAt: new Date().toISOString(),
          audience: "character",
          narration:
            joined.code === "character_exists"
              ? "That student is already in the Collegium. Close the other tab first."
              : joined.message,
          payload: {},
        }),
      );
      socket.disconnect(true);
      return;
    }

    const characterId = claimed.id;
    sockets.set(characterId, socket);
    deliver(sockets, characterId, joined.events, joined.notices);

    socket.on("command", (payload: unknown, ack?: (response: CommandAck) => void) => {
      const parsed = commandRequestSchema.safeParse(payload);
      if (!parsed.success) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: "invalid",
            status: "rejected",
            errorCode: "invalid_command",
            message: "That command was not a valid request.",
            resyncRequired: false,
          }),
        );
        return;
      }

      const intent = parsePlayerCommand(parsed.data.raw, characterId);
      if (!intent) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "unknown_command",
            message: `I do not recognize "${parsed.data.raw.trim()}."\n\nDid you mean:\n  look\n  say\n  north\n  south\n  east\n  west`,
            resyncRequired: false,
          }),
        );
        return;
      }

      if (!limiter.allow(`command:${characterId}`, COMMAND_RATE_MAX, COMMAND_RATE_WINDOW_MS)) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "rate_limited",
            message: "Please wait a moment before sending another command.",
            resyncRequired: false,
          }),
        );
        return;
      }

      if (
        intent.verb === "say" &&
        !limiter.allow(`say:${characterId}`, SAY_RATE_MAX, SAY_RATE_WINDOW_MS)
      ) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "rate_limited",
            message: "Please wait a moment before saying more.",
            resyncRequired: false,
          }),
        );
        return;
      }

      const result =
        intent.verb === "look"
          ? handleLook(world, intent, commandRuntime(sequences))
          : intent.verb === "move"
            ? handleMove(world, intent, commandRuntime(sequences))
            : handleSay(world, intent, commandRuntime(sequences));

      if (!result.ok) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: result.code,
            message: result.message,
            resyncRequired: false,
          }),
        );
        return;
      }

      const events = "events" in result ? result.events : [result.event];
      const notices = "notices" in result ? result.notices : [];
      const delivered = deliver(sockets, characterId, events, notices);
      const first = delivered[0];
      const last = delivered[delivered.length - 1];
      if (!first || !last) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "empty_result",
            message: "The command produced no events.",
            resyncRequired: false,
          }),
        );
        return;
      }

      reply(
        ack,
        commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "accepted",
          message:
            intent.verb === "look" ? "look" : intent.verb === "move" ? intent.direction : "say",
          eventSequenceStart: first.sequence,
          eventSequenceEnd: last.sequence,
          resyncRequired: false,
        }),
      );
    });

    socket.on("disconnect", () => {
      const occupant = world.characters[characterId];
      const roomId = occupant?.roomId;
      sockets.delete(characterId);
      const left = handleLeave(world, { verb: "leave", characterId }, commandRuntime(sequences));
      if (left.ok) {
        deliver(sockets, characterId, left.events, left.notices);
      }
      if (identity && roomId && options.persistRoom) {
        void options.persistRoom(characterId, roomId);
      }
    });
  });

  return io;
}

function deliver(
  sockets: Map<string, Socket>,
  actorId: string,
  events: readonly EventEnvelope[],
  notices: readonly { characterId: string; event: EventEnvelope }[],
): EventEnvelope[] {
  const mine = events.map((event) => eventEnvelopeSchema.parse(event));
  for (const event of mine) {
    sockets.get(actorId)?.emit("event", event);
  }
  for (const notice of notices) {
    sockets.get(notice.characterId)?.emit("event", eventEnvelopeSchema.parse(notice.event));
  }
  return mine;
}

function commandRuntime(sequences: Map<string, number>): EngineRuntime {
  return {
    now: () => new Date(),
    nextEventId: () => crypto.randomUUID(),
    nextSequence: (id) => {
      const next = (sequences.get(id) ?? 0) + 1;
      sequences.set(id, next);
      return next;
    },
  };
}

function reply(ack: ((response: CommandAck) => void) | undefined, response: CommandAck): void {
  ack?.(response);
}
