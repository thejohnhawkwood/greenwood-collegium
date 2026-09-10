import Fastify from "fastify";
import { commandAckSchema, eventEnvelopeSchema, type CommandAck } from "@greenwood/contracts";
import { io as ioClient, type Socket } from "socket.io-client";
import { afterEach, describe, expect, it } from "vitest";
import { createTestAuth, completeTestCharacter } from "../auth/test-harness.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import { createClassroomService } from "../application/classroom.js";
import { createOperationQueue } from "../application/operation-queue.js";
import { createDevWorld } from "../application/dev-world.js";
import { registerClassroomRoutes } from "../http/classroom.js";
import { attachRealtime } from "./gateway.js";

function command(socket: Socket, id: string, raw: string): Promise<CommandAck> {
  return new Promise((resolve, reject) =>
    socket
      .timeout(2000)
      .emit(
        "command",
        { schemaVersion: 0, commandId: id, raw, lastSequence: 0 },
        (error: Error | null, payload: unknown) =>
          error ? reject(error) : resolve(commandAckSchema.parse(payload)),
      ),
  );
}
describe("persistent moderation over live sockets", () => {
  const apps: ReturnType<typeof Fastify>[] = [];
  const clients: Socket[] = [];
  afterEach(async () => {
    for (const client of clients.splice(0)) client.close();
    for (const app of apps.splice(0)) await app.close();
  });
  async function setup() {
    const stores = createTestAuth();
    const classroom = createClassroomService(stores);
    const runExclusive = createOperationQueue();
    const owner = await stores.auth.bootstrap({
      token: stores.bootstrapToken,
      username: "teacher",
      password: "fictional-password",
    });
    if (!owner.ok) throw new Error(owner.message);
    await completeTestCharacter(stores.auth, owner.account.id, {
      name: "Rowan",
      speciesId: "hare",
      gender: "female",
    });
    const invite = await stores.auth.createInvite(owner.account.id, "student");
    if (!invite.ok) throw new Error(invite.message);
    const student = await stores.auth.acceptInvite({
      token: invite.token,
      username: "pupil",
      password: "fictional-password",
    });
    if (!student.ok) throw new Error(student.message);
    await completeTestCharacter(stores.auth, student.account.id, {
      name: "Hazel",
      speciesId: "mouse",
      gender: "female",
    });
    const app = Fastify({ logger: false });
    apps.push(app);
    await registerClassroomRoutes(app, { auth: stores.auth, classroom, runExclusive });
    const world = createDevWorld();
    await attachRealtime(app, world, {
      allowGuestPlay: false,
      classroom,
      runExclusive,
      resolveSession: (token) => stores.auth.resolvePlayIdentity(token),
      auditLog: stores.audit,
    });
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") throw new Error("Expected localhost port");
    const url = `http://127.0.0.1:${address.port}`;
    async function connect(token: string): Promise<Socket> {
      const client = ioClient(url, {
        transports: ["websocket"],
        reconnection: false,
        extraHeaders: { Cookie: `${SESSION_COOKIE}=${token}` },
      });
      clients.push(client);
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Socket seating timed out")), 2000);
        client.once("connect_error", (error) => {
          clearTimeout(timer);
          reject(error);
        });
        client.on("event", (payload: unknown) => {
          const event = eventEnvelopeSchema.safeParse(payload);
          if (event.success && event.data.type === "room.snapshot") {
            clearTimeout(timer);
            resolve();
          }
        });
      });
      return client;
    }
    const teacher = await connect(owner.sessionToken);
    const pupil = await connect(student.sessionToken);
    async function action(payload: unknown) {
      const result = await app.inject({
        method: "POST",
        url: "/admin/action",
        cookies: { [SESSION_COOKIE]: owner.sessionToken },
        payload,
      });
      expect(result.statusCode).toBe(200);
    }
    return {
      ...stores,
      classroom,
      runExclusive,
      owner,
      student,
      app,
      world,
      connect,
      teacher,
      pupil,
      action,
    };
  }
  it("records one realm-wide row per accepted say and never rebroadcasts a retry", async () => {
    const s = await setup();
    let observed = 0;
    s.teacher.on("event", (payload: unknown) => {
      if (eventEnvelopeSchema.safeParse(payload).data?.type === "chat.said") observed++;
    });
    expect((await command(s.pupil, "say-once", "say Fictional hello")).status).toBe("accepted");
    expect((await command(s.pupil, "say-once", "say Fictional hello")).status).toBe("accepted");
    const days = await s.classroom.days(s.owner.account.id);
    const page = await s.classroom.speech(s.owner.account.id, { day: days[0] ?? "", after: 0 });
    expect(page.records).toHaveLength(1);
    expect(page.records[0]).toMatchObject({
      username: "pupil",
      characterName: "Hazel the Mouse",
      text: "Fictional hello",
    });
    expect(observed).toBe(1);
    await command(s.pupil, "walk", "north");
    await command(s.pupil, "hall-speech", "say Fictional hall message");
    expect(
      (await s.classroom.speech(s.owner.account.id, { day: days[0] ?? "", after: 0 })).records,
    ).toHaveLength(2);
    expect(observed).toBe(1);
  });
  it("blocks speech during mute or realm pause, permits teacher speech, and immediately disconnects timeouts", async () => {
    const s = await setup();
    await s.action({ action: "mute", accountId: s.student.account.id, minutes: 10 });
    expect((await command(s.pupil, "muted-say", "say Test")).status).toBe("rejected");
    expect((await command(s.pupil, "look", "look")).status).toBe("accepted");
    await s.action({ action: "unmute", accountId: s.student.account.id });
    await s.action({ action: "chat-pause", paused: true });
    expect((await command(s.pupil, "paused-say", "say Test")).status).toBe("rejected");
    expect((await command(s.teacher, "teacher-say", "say Teacher instructions")).status).toBe(
      "accepted",
    );
    const disconnected = new Promise<void>((resolve) =>
      s.pupil.once("disconnect", () => resolve()),
    );
    await s.action({ action: "timeout", accountId: s.student.account.id, minutes: 10 });
    await disconnected;
    await expect(s.connect(s.student.sessionToken)).rejects.toThrow("sign_in_required");
  });
  it("fails closed on a speech-storage failure without broadcasting the unrecorded message", async () => {
    const s = await setup();
    let observed = 0;
    s.teacher.on("event", (payload: unknown) => {
      if (eventEnvelopeSchema.safeParse(payload).data?.type === "chat.said") observed++;
    });
    s.moderation.appendSpeech = async () => {
      throw new Error("Fictional database outage");
    };
    const questsBefore = structuredClone(s.world.quests);
    expect((await command(s.pupil, "storage-down", "say Must not broadcast")).status).toBe(
      "rejected",
    );
    expect(observed).toBe(0);
    expect(s.world.quests).toEqual(questsBefore);
  });
  it("removes connected student state during a full reset while leaving the teacher connected", async () => {
    const s = await setup();
    const identity = await s.auth.resolvePlayIdentity(s.student.sessionToken);
    const disconnected = new Promise<void>((resolve) =>
      s.pupil.once("disconnect", () => resolve()),
    );
    const preview = await s.classroom.resetPreview(s.owner.account.id);
    const result = await s.app.inject({
      method: "POST",
      url: "/admin/reset",
      cookies: { [SESSION_COOKIE]: s.owner.sessionToken },
      payload: { revision: preview.revision, confirmation: "RESET STUDENTS" },
    });
    expect(result.statusCode).toBe(200);
    await disconnected;
    expect(s.world.characters[identity?.characterId ?? ""]).toBeUndefined();
    expect((await command(s.teacher, "after-reset", "look")).status).toBe("accepted");
    await expect(s.connect(s.student.sessionToken)).rejects.toThrow("sign_in_required");
  });
});
