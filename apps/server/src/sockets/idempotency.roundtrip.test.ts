import { eventEnvelopeSchema, roomSnapshotEventSchema } from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { attachRealtime } from "./gateway.js";

describe("command idempotency", () => {
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

  it("does not move twice when the same command id is delivered again", async () => {
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
    await connected(client);

    expect((await command(client, "cmd-north-1", "north")).ack).toMatchObject({
      status: "accepted",
      message: "north",
    });
    expect((await command(client, "cmd-south-1", "south")).ack).toMatchObject({
      status: "accepted",
    });

    const replay = await command(client, "cmd-north-1", "north");
    expect(replay.ack).toMatchObject({
      commandId: "cmd-north-1",
      status: "accepted",
      message: "north",
    });

    const look = await command(client, "cmd-look-1", "look");
    expect(
      roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(look.events.at(-1))).payload.title,
    ).toBe("Lantern Court");
  });
});

async function connected(client: Socket): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => {
      resolve();
    });
    client.once("connect_error", reject);
  });
}

async function command(
  client: Socket,
  commandId: string,
  raw: string,
): Promise<{ ack: { commandId: string; status: string; message?: string }; events: unknown[] }> {
  const events: unknown[] = [];
  const onEvent = (payload: unknown) => {
    events.push(payload);
  };
  client.on("event", onEvent);
  const ack = await new Promise<{ commandId: string; status: string; message?: string }>(
    (resolve) => {
      client.emit("command", { schemaVersion: 0, commandId, raw, lastSequence: 0 }, resolve);
    },
  );
  client.off("event", onEvent);
  return { ack, events };
}
