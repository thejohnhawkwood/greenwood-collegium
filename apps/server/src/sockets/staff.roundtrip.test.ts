import { eventEnvelopeSchema } from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import {
  completeTestCharacter,
  createTestAuth,
  TEST_BOOTSTRAP_TOKEN,
} from "../auth/test-harness.js";
import { registerAuthRoutes } from "../http/auth.js";
import { attachRealtime } from "./gateway.js";

type CommandAck = {
  commandId: string;
  status: string;
  errorCode?: string;
  message?: string;
};

function emitCommand(client: Socket, commandId: string, raw: string): Promise<CommandAck> {
  return new Promise((resolve) => {
    client.emit("command", { schemaVersion: 0, commandId, raw, lastSequence: 0 }, resolve);
  });
}

function nextEventOfType(client: Socket, type: string): Promise<string> {
  return new Promise((resolve) => {
    const onEvent = (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (parsed.success && parsed.data.type === type) {
        client.off("event", onEvent);
        resolve(parsed.data.narration);
      }
    };
    client.on("event", onEvent);
  });
}

describe("teacher staff commands", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  let teacher: Socket | undefined;
  let guest: Socket | undefined;

  afterEach(async () => {
    teacher?.disconnect();
    guest?.disconnect();
    teacher = undefined;
    guest = undefined;
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("lets an owner announce, inspect, mute, and kick a guest", async () => {
    const { auth, audit } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: true, secureCookies: false });
    await attachRealtime(app, createDevWorld(), {
      allowGuestPlay: true,
      resolveSession: (token) => auth.resolvePlayIdentity(token),
      resolveSocketTicket: (ticket) => auth.resolveSocketTicket(ticket),
      auditLog: audit,
    });
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const boot = await app.inject({
      method: "POST",
      url: "/auth/bootstrap",
      payload: { token: TEST_BOOTSTRAP_TOKEN, username: "arbird", password: "lantern-path" },
    });
    const cookie = boot.cookies.find((entry) => entry.name === SESSION_COOKIE);
    if (!cookie) {
      throw new Error("missing session cookie");
    }
    await completeTestCharacter(auth, String(boot.json().accountId), {
      name: "Lumen",
      speciesId: "otter",
      gender: "female",
    });

    teacher = ioClient(`http://127.0.0.1:${String(address.port)}`, {
      transports: ["websocket"],
      extraHeaders: { Cookie: `${SESSION_COOKIE}=${cookie.value}` },
    });
    const teacherSeated = nextEventOfType(teacher, "room.snapshot");
    await new Promise<void>((resolve, reject) => {
      teacher?.once("connect", () => {
        resolve();
      });
      teacher?.once("connect_error", reject);
    });
    await teacherSeated;

    const guestSeated = new Promise<void>((resolve, reject) => {
      guest = ioClient(`http://127.0.0.1:${String(address.port)}`, {
        transports: ["websocket"],
      });
      const seated = nextEventOfType(guest, "room.snapshot");
      guest.once("connect", () => {
        void seated.then(() => {
          resolve();
        });
      });
      guest.once("connect_error", reject);
    });
    await guestSeated;
    if (!guest) {
      throw new Error("expected guest socket");
    }
    const guestAnnounce = new Promise<string>((resolve) => {
      const onEvent = (payload: unknown) => {
        const parsed = eventEnvelopeSchema.safeParse(payload);
        if (parsed.success && parsed.data.narration.startsWith("A teacher announces:")) {
          guest.off("event", onEvent);
          resolve(parsed.data.narration);
        }
      };
      guest.on("event", onEvent);
    });
    const announced = await emitCommand(
      teacher,
      "cmd-announce",
      "admin announce The lanterns are lit.",
    );
    expect(announced.status).toBe("accepted");
    expect(await guestAnnounce).toBe("A teacher announces: The lanterns are lit.");

    const inspected = await emitCommand(teacher, "cmd-inspect", "admin inspect rowan");
    expect(inspected.status).toBe("accepted");

    const muted = await emitCommand(teacher, "cmd-mute", "admin mute rowan 10");
    expect(muted.status).toBe("accepted");
    const said = await emitCommand(guest, "cmd-say", "say hello");
    expect(said).toMatchObject({ status: "rejected", errorCode: "forbidden" });
    expect(said.message).toContain("muted");

    const kicked = await emitCommand(teacher, "cmd-kick", "admin kick rowan");
    expect(kicked.status).toBe("accepted");
    await new Promise<void>((resolve) => {
      guest?.once("disconnect", () => {
        resolve();
      });
    });

    const log = await audit.listRecent(10);
    expect(log.map((row) => row.action)).toEqual(
      expect.arrayContaining(["announce", "inspect", "mute", "kick"]),
    );
  });
});
