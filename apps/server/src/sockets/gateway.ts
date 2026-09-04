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
import { CommandLog } from "../application/command-log.js";
import {
  COMMAND_RATE_MAX,
  COMMAND_RATE_WINDOW_MS,
  RateLimiter,
  SAY_RATE_MAX,
  SAY_RATE_WINDOW_MS,
} from "../application/rate-limit.js";
import { claimDevCharacter, DEV_START_ROOM_ID } from "../application/session-characters.js";
import { sessionSnapshotEvent } from "../application/session-snapshot.js";
import { parseCookie, SESSION_COOKIE } from "../auth/cookies.js";
import type { PlayIdentity } from "../auth/service.js";

export const DEFAULT_RECONNECT_GRACE_MS = 10_000;

export type RealtimeOptions = {
  allowGuestPlay?: boolean;
  reconnectGraceMs?: number;
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
  const reconnectGraceMs = options.reconnectGraceMs ?? DEFAULT_RECONNECT_GRACE_MS;
  const sequences = new Map<string, number>();
  const sockets = new Map<string, Socket>();
  const leaveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const commandLog = new CommandLog();
  const limiter = new RateLimiter();
  const io = new Server(app.server, {
    cors: {
      origin: allowedOrigins(),
      credentials: true,
    },
  });

  app.addHook("onClose", async () => {
    for (const timer of leaveTimers.values()) {
      clearTimeout(timer);
    }
    leaveTimers.clear();
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
      noticeAndDisconnect(socket, "The courtyard cannot hold another student right now.");
      return;
    }

    const characterId = claimed.id;
    const present = world.characters[characterId];
    if (identity && present) {
      resumeAuthenticated(socket, characterId);
      bindCommandHandlers(socket, characterId, identity);
      return;
    }

    const runtime = commandRuntime(sequences);
    const joined = handleJoin(
      world,
      {
        verb: "join",
        characterId,
        name: claimed.name,
        roomId: "roomId" in claimed ? claimed.roomId : DEV_START_ROOM_ID,
      },
      runtime,
    );
    if (!joined.ok) {
      noticeAndDisconnect(
        socket,
        joined.code === "character_exists"
          ? "That student is already in the Collegium. Close the other tab first."
          : joined.message,
      );
      return;
    }

    sockets.set(characterId, socket);
    deliver(sockets, characterId, joined.events, joined.notices);
    bindCommandHandlers(socket, characterId, identity);
  });

  function resumeAuthenticated(socket: Socket, characterId: string): void {
    const previous = sockets.get(characterId);
    if (previous && previous !== socket) {
      previous.disconnect(true);
    }
    const timer = leaveTimers.get(characterId);
    if (timer) {
      clearTimeout(timer);
      leaveTimers.delete(characterId);
    }
    sockets.set(characterId, socket);
    const runtime = commandRuntime(sequences);
    const snapshot = sessionSnapshotEvent(world, characterId, runtime);
    const look = handleLook(world, { verb: "look", characterId }, runtime);
    const events = look.ok ? [snapshot, look.event] : [snapshot];
    deliver(sockets, characterId, events, []);
  }

  function bindCommandHandlers(
    socket: Socket,
    characterId: string,
    identity: PlayIdentity | undefined,
  ): void {
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

      const recorded = commandLog.get(characterId, parsed.data.commandId);
      if (recorded) {
        deliver(sockets, characterId, recorded.events, recorded.notices);
        reply(ack, recorded.ack);
        return;
      }

      const intent = parsePlayerCommand(parsed.data.raw, characterId);
      if (!intent) {
        const rejection = commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: "unknown_command",
          message: `I do not recognize "${parsed.data.raw.trim()}."\n\nDid you mean:\n  look\n  say\n  north\n  south\n  east\n  west`,
          resyncRequired: false,
        });
        commandLog.set(characterId, parsed.data.commandId, {
          ack: rejection,
          events: [],
          notices: [],
        });
        reply(ack, rejection);
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
        const rejection = commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "rejected",
          errorCode: result.code,
          message: result.message,
          resyncRequired: false,
        });
        commandLog.set(characterId, parsed.data.commandId, {
          ack: rejection,
          events: [],
          notices: [],
        });
        reply(ack, rejection);
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

      const accepted = commandAckSchema.parse({
        commandId: parsed.data.commandId,
        status: "accepted",
        message:
          intent.verb === "look" ? "look" : intent.verb === "move" ? intent.direction : "say",
        eventSequenceStart: first.sequence,
        eventSequenceEnd: last.sequence,
        resyncRequired: false,
      });
      commandLog.set(characterId, parsed.data.commandId, {
        ack: accepted,
        events: delivered,
        notices,
      });
      reply(ack, accepted);
    });

    socket.on("disconnect", () => {
      if (sockets.get(characterId) !== socket) {
        return;
      }
      const occupant = world.characters[characterId];
      const roomId = occupant?.roomId;
      if (identity && options.persistRoom && roomId) {
        void options.persistRoom(characterId, roomId);
      }
      if (identity && reconnectGraceMs > 0) {
        const timer = setTimeout(() => {
          leaveTimers.delete(characterId);
          if (sockets.get(characterId) !== socket) {
            return;
          }
          sockets.delete(characterId);
          const left = handleLeave(
            world,
            { verb: "leave", characterId },
            commandRuntime(sequences),
          );
          if (left.ok) {
            deliver(sockets, characterId, left.events, left.notices);
          }
        }, reconnectGraceMs);
        leaveTimers.set(characterId, timer);
        return;
      }
      sockets.delete(characterId);
      const left = handleLeave(world, { verb: "leave", characterId }, commandRuntime(sequences));
      if (left.ok) {
        deliver(sockets, characterId, left.events, left.notices);
      }
    });
  }

  return io;
}

function noticeAndDisconnect(socket: Socket, narration: string): void {
  socket.emit(
    "event",
    eventEnvelopeSchema.parse({
      eventId: crypto.randomUUID(),
      sequence: 1,
      schemaVersion,
      type: "system.notice",
      occurredAt: new Date().toISOString(),
      audience: "character",
      narration,
      payload: {},
    }),
  );
  socket.disconnect(true);
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
