import {
  commandAckSchema,
  commandRequestSchema,
  eventEnvelopeSchema,
  type CommandAck,
} from "@greenwood/contracts";
import { handleLook, parseLookCommand, type WorldState } from "@greenwood/game-engine";
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

      const intent = parseLookCommand(parsed.data.raw, characterId);
      if (!intent) {
        reply(
          ack,
          commandAckSchema.parse({
            commandId: parsed.data.commandId,
            status: "rejected",
            errorCode: "unknown_command",
            message: `I do not recognize "${parsed.data.raw.trim()}."\n\nDid you mean:\n  look`,
            resyncRequired: false,
          }),
        );
        return;
      }

      const result = handleLook(world, intent, {
        now: () => new Date(),
        nextEventId: () => crypto.randomUUID(),
        nextSequence: (id) => {
          const next = (sequences.get(id) ?? 0) + 1;
          sequences.set(id, next);
          return next;
        },
      });

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

      const event = eventEnvelopeSchema.parse(result.event);
      socket.emit("event", event);
      reply(
        ack,
        commandAckSchema.parse({
          commandId: parsed.data.commandId,
          status: "accepted",
          message: "look",
          eventSequenceStart: event.sequence,
          eventSequenceEnd: event.sequence,
          resyncRequired: false,
        }),
      );
    });
  });

  return io;
}

function reply(ack: ((response: CommandAck) => void) | undefined, response: CommandAck): void {
  ack?.(response);
}
