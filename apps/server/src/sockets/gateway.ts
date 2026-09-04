import {
  commandAckSchema,
  commandRequestSchema,
  eventEnvelopeSchema,
  type CommandAck,
} from "@greenwood/contracts";
import {
  handleLook,
  handleMove,
  parsePlayerCommand,
  type EngineRuntime,
  type WorldState,
} from "@greenwood/game-engine";
import type { FastifyInstance } from "fastify";
import { Server } from "socket.io";
import { DEV_CHARACTER_ID } from "../application/dev-world.js";

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

export async function attachRealtime(app: FastifyInstance, world: WorldState): Promise<Server> {
  await app.ready();

  const sequences = new Map<string, number>();
  const io = new Server(app.server, {
    cors: {
      origin: allowedOrigins(),
    },
  });

  app.addHook("onClose", async () => {
    await io.close();
  });

  io.on("connection", (socket) => {
    const characterId = DEV_CHARACTER_ID;

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
            message: `I do not recognize "${parsed.data.raw.trim()}."\n\nDid you mean:\n  look\n  north\n  south\n  east\n  west`,
            resyncRequired: false,
          }),
        );
        return;
      }

      const runtime = commandRuntime(sequences);
      const result =
        intent.verb === "look"
          ? handleLook(world, intent, runtime)
          : handleMove(world, intent, runtime);

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
      const delivered = events.map((event) => eventEnvelopeSchema.parse(event));
      for (const event of delivered) {
        socket.emit("event", event);
      }

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
          message: intent.verb === "look" ? "look" : intent.direction,
          eventSequenceStart: first.sequence,
          eventSequenceEnd: last.sequence,
          resyncRequired: false,
        }),
      );
    });
  });

  return io;
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
