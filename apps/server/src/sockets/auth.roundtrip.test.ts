import { eventEnvelopeSchema, roomSnapshotEventSchema } from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import { createTestAuth, TEST_BOOTSTRAP_TOKEN } from "../auth/test-harness.js";
import { registerAuthRoutes } from "../http/auth.js";
import { attachRealtime } from "./gateway.js";

describe("authenticated socket identity", () => {
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

  it("refuses guests in production mode and accepts a signed-in character", async () => {
    const { auth } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: false });
    await attachRealtime(app, createDevWorld(), {
      allowGuestPlay: false,
      resolveSession: (token) => auth.resolvePlayIdentity(token),
    });
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const guest = ioClient(`http://127.0.0.1:${String(address.port)}`, {
      transports: ["websocket"],
    });
    const guestError = await new Promise<Error>((resolve, reject) => {
      guest.once("connect_error", (error) => {
        resolve(error);
      });
      guest.once("connect", () => {
        reject(new Error("guest should not connect"));
      });
    });
    guest.close();
    expect(guestError.message).toContain("sign_in_required");

    const boot = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "Rowan", password: "lantern-path" },
    });
    const cookie = boot.cookies.find((entry) => entry.name === SESSION_COOKIE);
    if (!cookie) {
      throw new Error("missing session cookie");
    }

    client = ioClient(`http://127.0.0.1:${String(address.port)}`, {
      transports: ["websocket"],
      extraHeaders: { Cookie: `${SESSION_COOKIE}=${cookie.value}` },
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
        { schemaVersion: 0, commandId: "cmd-look-auth", raw: "look", lastSequence: 0 },
        resolve,
      );
    });
    expect(ack).toMatchObject({ status: "accepted" });
    const event = roomSnapshotEventSchema.parse(eventEnvelopeSchema.parse(await eventPromise));
    expect(event.payload.title).toBe("Lantern Court");
    expect(event.narration).not.toContain("Rowan the Hare");
  });
});
