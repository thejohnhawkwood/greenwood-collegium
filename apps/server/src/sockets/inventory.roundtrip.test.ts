import {
  eventEnvelopeSchema,
  itemTakenEventSchema,
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
};

async function connectClient(port: number): Promise<Socket> {
  const client = ioClient(`http://127.0.0.1:${String(port)}`, {
    transports: ["websocket"],
  });
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => {
      resolve();
    });
    client.once("connect_error", reject);
  });
  return client;
}

function emitCommand(client: Socket, commandId: string, raw: string): Promise<CommandAck> {
  return new Promise((resolve) => {
    client.emit(
      "command",
      { schemaVersion: 0, commandId, raw, lastSequence: 0, characterId: "forged" },
      resolve,
    );
  });
}

function nextEventOfType(client: Socket, type: string): Promise<unknown> {
  return new Promise((resolve) => {
    const onEvent = (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (parsed.success && parsed.data.type === type) {
        client.off("event", onEvent);
        resolve(payload);
      }
    };
    client.on("event", onEvent);
  });
}

describe("inventory socket round trip", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  let first: Socket | undefined;
  let second: Socket | undefined;

  afterEach(async () => {
    first?.disconnect();
    second?.disconnect();
    first = undefined;
    second = undefined;
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("lets one student take the copper key and refuses the second", async () => {
    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    first = await connectClient(address.port);

    const lookEvent = nextEventOfType(first, "room.snapshot");
    const look = await emitCommand(first, "cmd-look-key", "look");
    expect(look.status).toBe("accepted");
    expect(
      roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(await lookEvent)).narration,
    ).toContain("Small Copper Key");

    const takeEvent = nextEventOfType(first, "item.taken");
    const taken = await emitCommand(first, "cmd-take-key", "take key");
    expect(taken).toMatchObject({ status: "accepted", message: "take" });
    expect(itemTakenEventSchema.parse(eventEnvelopeSchema.parse(await takeEvent)).narration).toBe(
      "You take the Small Copper Key.",
    );

    second = await connectClient(address.port);
    const blocked = await emitCommand(second, "cmd-take-key-too", "take key");
    expect(blocked).toMatchObject({
      status: "rejected",
      errorCode: "item_not_found",
    });

    const bagEvent = nextEventOfType(first, "inventory.updated");
    const bag = await emitCommand(first, "cmd-inv", "inventory");
    expect(bag.status).toBe("accepted");
    const bagEnvelope = eventEnvelopeSchema.parse(await bagEvent);
    expect(bagEnvelope.narration).toContain("Small Copper Key");
  });
});
