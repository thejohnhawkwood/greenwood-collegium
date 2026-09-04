import {
  eventEnvelopeSchema,
  roomSnapshotEventSchema,
  sessionSnapshotEventSchema,
} from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import { createTestAuth, TEST_BOOTSTRAP_TOKEN } from "../auth/test-harness.js";
import { registerAuthRoutes } from "../http/auth.js";
import { attachRealtime } from "./gateway.js";

describe("authenticated reconnection", () => {
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

  it("resumes the same room and ignores a replayed move after refresh", async () => {
    const { auth, characters } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: false });
    await attachRealtime(app, createDevWorld(), {
      allowGuestPlay: false,
      reconnectGraceMs: 250,
      resolveSession: (token) => auth.resolvePlayIdentity(token),
      persistRoom: (characterId, roomId) => characters.updateRoom(characterId, roomId),
    });
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const boot = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "Rowan", password: "lantern-path" },
    });
    const cookie = boot.cookies.find((entry) => entry.name === SESSION_COOKIE);
    if (!cookie) {
      throw new Error("missing session cookie");
    }

    first = connectAuth(address.port, cookie.value);
    await connected(first);
    expect((await command(first, "cmd-north-1", "north")).ack.status).toBe("accepted");
    expect((await command(first, "cmd-south-1", "south")).ack.status).toBe("accepted");
    first.disconnect();

    second = connectAuth(address.port, cookie.value);
    const resumed = await nextEvent(second);
    expect(
      sessionSnapshotEventSchema.parse(eventEnvelopeSchema.parse(resumed)).payload.roomId,
    ).toBe("lantern-court");
    await connected(second);

    const replay = await command(second, "cmd-north-1", "north");
    expect(replay.ack).toMatchObject({ commandId: "cmd-north-1", status: "accepted" });
    const look = await command(second, "cmd-look-resume", "look");
    expect(
      roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(look.events.at(-1))).payload.title,
    ).toBe("Lantern Court");
  });
});

function connectAuth(port: number, cookie: string): Socket {
  return ioClient(`http://127.0.0.1:${String(port)}`, {
    transports: ["websocket"],
    extraHeaders: { Cookie: `${SESSION_COOKIE}=${cookie}` },
  });
}

async function connected(client: Socket): Promise<void> {
  if (client.connected) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => {
      resolve();
    });
    client.once("connect_error", reject);
  });
}

function nextEvent(client: Socket): Promise<unknown> {
  return new Promise((resolve) => {
    client.once("event", resolve);
  });
}

async function command(
  client: Socket,
  commandId: string,
  raw: string,
): Promise<{ ack: { commandId: string; status: string }; events: unknown[] }> {
  const events: unknown[] = [];
  const onEvent = (payload: unknown) => {
    events.push(payload);
  };
  client.on("event", onEvent);
  const ack = await new Promise<{ commandId: string; status: string }>((resolve) => {
    client.emit("command", { schemaVersion: 0, commandId, raw, lastSequence: 0 }, resolve);
  });
  client.off("event", onEvent);
  return { ack, events };
}
