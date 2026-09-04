import {
  eventEnvelopeSchema,
  mapDiscoveredEventSchema,
  roomSnapshotEventSchema,
} from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { attachRealtime } from "./gateway.js";

type CommandAck = {
  commandId: string;
  status: string;
  errorCode?: string;
  message?: string;
  eventSequenceStart?: number;
  eventSequenceEnd?: number;
};

async function emitCommand(
  client: Socket,
  commandId: string,
  raw: string,
  lastSequence: number,
): Promise<{ ack: CommandAck; events: unknown[] }> {
  const events: unknown[] = [];
  const onEvent = (payload: unknown) => {
    events.push(payload);
  };
  client.on("event", onEvent);
  const ack = await new Promise<CommandAck>((resolve) => {
    client.emit(
      "command",
      {
        schemaVersion: 0,
        commandId,
        raw,
        lastSequence,
        characterId: "forged-other-character",
      },
      resolve,
    );
  });
  client.off("event", onEvent);
  return { ack, events };
}

describe("move socket round trip", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  let client: Socket | undefined;

  afterEach(async () => {
    client?.disconnect();
    client = undefined;
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("walks three rooms and rejects a missing exit", async () => {
    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });

    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    client = ioClient(`http://127.0.0.1:${String(address.port)}`, {
      transports: ["websocket"],
    });
    await new Promise<void>((resolve, reject) => {
      client?.once("connect", () => {
        resolve();
      });
      client?.once("connect_error", reject);
    });

    const north = await emitCommand(client, "cmd-north-1", "n", 0);
    expect(north.ack).toMatchObject({
      commandId: "cmd-north-1",
      status: "accepted",
      eventSequenceStart: 1,
      eventSequenceEnd: 2,
    });
    const discovered = mapDiscoveredEventSchema.parse(eventEnvelopeSchema.parse(north.events[0]));
    const hall = roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(north.events[1]));
    expect(discovered.payload.title).toBe("Great Hall");
    expect(hall.payload.title).toBe("Great Hall");

    const south = await emitCommand(client, "cmd-south-1", "south", 2);
    expect(south.ack).toMatchObject({ status: "accepted" });
    expect(
      roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(south.events[0])).payload.title,
    ).toBe("Lantern Court");

    const west = await emitCommand(client, "cmd-west-1", "west", 3);
    expect(west.ack).toMatchObject({ status: "accepted", message: "west" });
    expect(west.events).toHaveLength(2);
    expect(
      roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(west.events[1])).payload.title,
    ).toBe("West Cloister");

    const blocked = await emitCommand(client, "cmd-south-2", "south", 5);
    expect(blocked.ack).toMatchObject({
      commandId: "cmd-south-2",
      status: "rejected",
      errorCode: "no_exit",
    });
    expect(blocked.events).toHaveLength(0);
  });
});
