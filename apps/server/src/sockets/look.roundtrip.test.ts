import { eventEnvelopeSchema, roomSnapshotEventSchema } from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { attachRealtime } from "./gateway.js";

describe("look socket round trip", () => {
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

  it("accepts look from a client and emits a validated room.snapshot", async () => {
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

    const eventPromise = new Promise((resolve) => {
      client?.once("event", resolve);
    });

    const ack = await new Promise((resolve) => {
      client?.emit(
        "command",
        {
          schemaVersion: 0,
          commandId: "cmd-look-1",
          raw: "look",
          lastSequence: 0,
          characterId: "forged-other-character",
        },
        resolve,
      );
    });

    expect(ack).toMatchObject({
      commandId: "cmd-look-1",
      status: "accepted",
    });

    const event = roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(await eventPromise));
    expect(event.payload.title).toBe("Lantern Court");
    expect(event.narration).toContain("Porter Bramble");
    expect(event.narration).not.toContain("forged-other-character");
  });
});
