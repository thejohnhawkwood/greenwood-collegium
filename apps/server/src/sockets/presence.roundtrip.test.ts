import {
  chatSaidEventSchema,
  entityEnteredEventSchema,
  eventEnvelopeSchema,
  roomSnapshotEventSchema,
} from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { attachRealtime } from "./gateway.js";

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

function emitCommand(client: Socket, commandId: string, raw: string): Promise<unknown> {
  return new Promise((resolve) => {
    client.emit(
      "command",
      { schemaVersion: 0, commandId, raw, lastSequence: 0, characterId: "forged" },
      resolve,
    );
  });
}

describe("presence and say socket round trip", () => {
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

  it("lets two clients see one another and share room chat", async () => {
    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const arrivals: unknown[] = [];
    first = await connectClient(address.port);
    first.on("event", (payload: unknown) => {
      arrivals.push(payload);
    });

    second = await connectClient(address.port);
    await waitFor(() => arrivals.some((payload) => isEntered(payload)));
    expect(
      entityEnteredEventSchema.parse(eventEnvelopeSchema.parse(findEntered(arrivals))).narration,
    ).toBe("Moss the Mole arrives.");

    const firstLook = nextEvent(first);
    await emitCommand(first, "cmd-look-a", "look");
    const firstRoom = roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(await firstLook));
    expect(firstRoom.narration).toContain("Moss the Mole");
    expect(firstRoom.narration).not.toContain("Rowan the Hare");

    const secondLook = nextEvent(second);
    await emitCommand(second, "cmd-look-b", "look");
    const secondRoom = roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(await secondLook));
    expect(secondRoom.narration).toContain("Rowan the Hare");

    const heard = nextEvent(second);
    const said = await emitCommand(first, "cmd-say-1", "say Meet me in the library.");
    expect(said).toMatchObject({ status: "accepted", message: "say" });
    expect(chatSaidEventSchema.parse(eventEnvelopeSchema.parse(await heard)).narration).toBe(
      'Rowan the Hare says, "Meet me in the library."',
    );
  });
});

function nextEvent(client: Socket): Promise<unknown> {
  return new Promise((resolve) => {
    client.once("event", resolve);
  });
}

function isEntered(payload: unknown): boolean {
  const parsed = eventEnvelopeSchema.safeParse(payload);
  return parsed.success && parsed.data.type === "entity.entered";
}

function findEntered(payloads: unknown[]): unknown {
  const found = payloads.find(isEntered);
  if (!found) {
    throw new Error("expected entity.entered");
  }
  return found;
}

async function waitFor(predicate: () => boolean): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > 1000) {
      throw new Error("timed out waiting for presence event");
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 10);
    });
  }
}
