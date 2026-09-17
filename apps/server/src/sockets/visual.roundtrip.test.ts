import {
  DEFAULT_APPEARANCE,
  PLAY_STATE_EVENT,
  playStateSchema,
  type PlayState,
} from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io, type Socket } from "socket.io-client";
import { buildApp } from "../app.js";
import { createDevWorld } from "../application/dev-world.js";
import { createTestAuth, TEST_BOOTSTRAP_TOKEN } from "../auth/test-harness.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import { attachRealtime } from "./gateway.js";

describe("visual state over authenticated sockets", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  const sockets: Socket[] = [];
  afterEach(async () => {
    for (const socket of sockets) socket.disconnect();
    await app?.close();
  });

  it("replaces room presence after joins and movement, and restores saved appearance after reconnect and replay", async () => {
    const { auth, characters } = createTestAuth();
    const owner = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "private-owner-login",
      password: "lantern-path",
    });
    if (!owner.ok) throw new Error(owner.message);
    const appearance = {
      ...DEFAULT_APPEARANCE,
      palette: "ash" as const,
      accessory: "scarf" as const,
    };
    expect(
      (
        await auth.completeCharacter(owner.account.id, {
          name: "Briar",
          speciesId: "fox",
          gender: "female",
          appearance,
        })
      ).ok,
    ).toBe(true);
    const invite = await auth.createInvite(owner.account.id, "teacher");
    if (!invite.ok) throw new Error(invite.message);
    const peer = await auth.acceptInvite({
      token: invite.token,
      username: "private-peer-login",
      password: "lantern-path",
    });
    if (!peer.ok) throw new Error(peer.message);
    expect(
      (
        await auth.completeCharacter(peer.account.id, {
          name: "Moss",
          speciesId: "mole",
          gender: "male",
        })
      ).ok,
    ).toBe(true);
    app = await buildApp();
    await attachRealtime(app, createDevWorld(), {
      allowGuestPlay: false,
      reconnectGraceMs: 1000,
      resolveSession: (token) => auth.resolvePlayIdentity(token),
      persistRoom: (id, roomId) => characters.updateRoom(id, roomId),
      persistDiscovery: (id, roomIds) => characters.updateDiscovery(id, roomIds),
    });
    await app.listen({ host: "127.0.0.1", port: 0 });
    const address = app.server.address();
    if (!address || typeof address === "string") throw new Error("Missing TCP address");
    const connect = (cookie: string) => {
      const socket = io(`http://127.0.0.1:${address.port}`, {
        autoConnect: false,
        transports: ["websocket"],
        extraHeaders: { Cookie: `${SESSION_COOKIE}=${cookie}` },
      });
      sockets.push(socket);
      return socket;
    };
    const first = connect(owner.sessionToken);
    let waiting = nextState(first);
    first.connect();
    const initial = await waiting;
    expect(initial.character.visual).toEqual({
      speciesId: "fox",
      gender: "female",
      appearance,
    });
    expect(initial.room.roomId).toBe("lantern-court");
    const second = connect(peer.sessionToken);
    waiting = nextState(first);
    const peerReady = nextState(second);
    second.connect();
    await peerReady;
    const occupied = await waiting;
    expect(occupied.room.visible.find((entity) => entity.name === "Moss the Mole")?.visual).toEqual(
      {
        speciesId: "mole",
        gender: "male",
        appearance: DEFAULT_APPEARANCE,
      },
    );
    expect(JSON.stringify(occupied)).not.toContain("private-peer-login");
    expect(JSON.stringify(occupied)).not.toContain("private-owner-login");
    waiting = nextState(first);
    const departed = nextState(second);
    await command(first, "move-north", "north");
    const moved = await waiting;
    expect(moved.room.roomId).toBe("great-hall");
    expect(moved.minimap.rooms).toHaveLength(38);
    expect(moved.minimap.rooms.find((room) => room.id === "lantern-court")).toMatchObject({
      state: "explored",
      title: "Lantern Court",
    });
    expect(moved.minimap.rooms.find((room) => room.id === "great-hall")).toMatchObject({
      state: "current",
      title: "Great Hall",
    });
    expect(moved.minimap.rooms.find((room) => room.id === "observatory")).toMatchObject({
      state: "unknown",
    });
    expect(JSON.stringify(moved.minimap)).not.toContain("Observatory");
    expect((await departed).room.visible.some((entity) => entity.id === initial.character.id)).toBe(
      false,
    );
    first.disconnect();
    const resumed = connect(owner.sessionToken);
    waiting = nextState(resumed);
    resumed.connect();
    const restored = await waiting;
    expect(restored.character.visual).toEqual(initial.character.visual);
    expect(restored.room.roomId).toBe("great-hall");
    expect(restored.minimap.rooms.find((room) => room.id === "lantern-court")?.state).toBe(
      "explored",
    );
    waiting = nextState(resumed);
    await command(resumed, "move-south", "south");
    await waiting;
    waiting = nextState(resumed);
    await command(resumed, "move-north", "north");
    // An old acknowledgement is replayed, but the current visual state stays in the current room.
    expect((await waiting).room.roomId).toBe("lantern-court");
  });
});

function nextState(socket: Socket): Promise<PlayState> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(PLAY_STATE_EVENT, receive);
      reject(new Error("No visual snapshot"));
    }, 2500);
    function receive(payload: unknown) {
      clearTimeout(timer);
      socket.off(PLAY_STATE_EVENT, receive);
      const parsed = playStateSchema.safeParse(payload);
      if (parsed.success) resolve(parsed.data);
      else reject(new Error("Invalid visual snapshot"));
    }
    socket.on(PLAY_STATE_EVENT, receive);
  });
}

async function command(socket: Socket, commandId: string, raw: string) {
  const ack: unknown = await socket
    .timeout(2500)
    .emitWithAck("command", { commandId, raw, schemaVersion: 0, lastSequence: 0 });
  expect(ack).toMatchObject({ status: "accepted" });
}
