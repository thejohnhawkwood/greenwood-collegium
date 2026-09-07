import { afterEach, describe, expect, it } from "vitest";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import {
  completeTestCharacter,
  createTestAuth,
  TEST_BOOTSTRAP_TOKEN,
} from "../auth/test-harness.js";
import { registerAuthRoutes } from "../http/auth.js";
import { attachRealtime } from "../sockets/gateway.js";
import { CLASSROOM_LOAD_CLIENTS, runClassroomLoad } from "./classroom-load.js";
import { formatLoadReport } from "./load-metrics.js";

describe("classroom load", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }
  });

  it("connects 30 signed-in Collegians, looks, speaks, moves, and reconnects", async () => {
    const { auth, characters } = createTestAuth();
    app = await buildApp();
    await registerAuthRoutes(app, { auth, allowGuestPlay: false, secureCookies: false });
    await attachRealtime(app, createDevWorld(), {
      allowGuestPlay: false,
      resolveSession: (token) => auth.resolvePlayIdentity(token),
      persistRoom: (characterId, roomId) => characters.updateRoom(characterId, roomId),
    });
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "loadteacher",
      password: "lantern-path",
    });
    if (!owner.ok) {
      throw new Error(owner.message);
    }
    const invites = await auth.createInvite(owner.account.id, "student", CLASSROOM_LOAD_CLIENTS);
    if (!invites.ok) {
      throw new Error(invites.message);
    }

    const sessionTokens: string[] = [];
    for (const [index, token] of invites.tokens.entries()) {
      const accepted = await auth.acceptInvite({
        token,
        username: `load${String(index).padStart(2, "0")}`,
        password: "lantern-path",
      });
      if (!accepted.ok) {
        throw new Error(accepted.message);
      }
      await completeTestCharacter(auth, accepted.account.id, {
        name: collegianName(index),
        speciesId: "hare",
        gender: "female",
      });
      sessionTokens.push(accepted.sessionToken);
    }

    const report = await runClassroomLoad({
      origin: `http://127.0.0.1:${String(address.port)}`,
      sessionTokens,
    });
    expect(formatLoadReport(report)).toContain("passed");
    expect(report.clients).toBe(30);
    expect(report.connected).toBe(30);
    expect(report.lookAccepted).toBe(30);
    expect(report.sayAccepted).toBe(30);
    expect(report.moveAccepted).toBeGreaterThanOrEqual(20);
    expect(report.reconnects).toBe(5);
    expect(report.passed).toBe(true);
  }, 60_000);
});

function collegianName(index: number): string {
  const first = String.fromCharCode(65 + Math.floor(index / 26));
  const second = String.fromCharCode(65 + (index % 26));
  return `Pip ${first}${second}`;
}
