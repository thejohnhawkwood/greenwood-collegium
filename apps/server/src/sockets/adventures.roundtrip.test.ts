import { eventEnvelopeSchema, type CommandAck, type EventEnvelope } from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { buildApp } from "../app.js";
import { createDevWorld } from "../application/dev-world.js";
import { SESSION_COOKIE } from "../auth/cookies.js";
import {
  completeTestCharacter,
  createTestAuth,
  TEST_BOOTSTRAP_TOKEN,
} from "../auth/test-harness.js";
import { attachRealtime } from "./gateway.js";

describe("adventure persistence and private dialogue", () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  const clients: Socket[] = [];
  async function stop() {
    for (const client of clients.splice(0)) client.disconnect();
    await app?.close();
    app = undefined;
  }
  afterEach(stop);

  it("persists accepted clues before acknowledgement and resumes without another reward after server restarts", async () => {
    const { auth, characters, quests } = createTestAuth();
    const boot = await auth.bootstrap({
      token: TEST_BOOTSTRAP_TOKEN,
      username: "Rowan",
      password: "lantern-path",
    });
    if (!boot.ok) throw new Error(boot.message);
    await completeTestCharacter(auth, boot.account.id);
    const identity = await auth.resolvePlayIdentity(boot.sessionToken);
    if (!identity) throw new Error("Missing fictional identity");

    async function start() {
      app = await buildApp();
      await attachRealtime(app, createDevWorld(), {
        allowGuestPlay: true,
        resolveSession: (token) => auth.resolvePlayIdentity(token),
        persistRoom: (id, roomId) => characters.updateRoom(id, roomId),
        persistProgress: (id, progress) => characters.updateProgress(id, progress),
        persistQuest: quests,
      });
      await app.listen({ port: 0, host: "127.0.0.1" });
      const address = app.server.address();
      if (!address || typeof address === "string") throw new Error("Missing TCP address");
      return address.port;
    }

    async function connect(port: number, token?: string) {
      const events: EventEnvelope[] = [];
      const client = ioClient(`http://127.0.0.1:${port}`, {
        transports: ["websocket"],
        extraHeaders: token ? { Cookie: `${SESSION_COOKIE}=${token}` } : undefined,
      });
      clients.push(client);
      client.on("event", (payload: unknown) => events.push(eventEnvelopeSchema.parse(payload)));
      await new Promise<void>((resolve, reject) => {
        client.once("connect", resolve);
        client.once("connect_error", reject);
      });
      return { client, events };
    }

    let sequence = 0;
    async function command(client: Socket, raw: string, commandId = `adventure-${++sequence}`) {
      const ack = await new Promise<CommandAck>((resolve) =>
        client.emit(
          "command",
          { schemaVersion: 0, commandId, raw, lastSequence: 0, characterId: "forged-target" },
          resolve,
        ),
      );
      expect(ack.status, `${raw}: ${ack.message ?? ""}`).toBe("accepted");
    }
    const progress = async () =>
      (await quests.listByCharacter(identity.characterId)).find(
        (quest) => quest.questId === "the-missing-pages",
      );
    const port = await start();
    const first = await connect(port, boot.sessionToken);
    const observer = await connect(port);
    for (const raw of ["north", "west"]) await command(first.client, raw);
    for (const raw of ["north", "west"]) await command(observer.client, raw);
    const before = observer.events.length;
    await command(first.client, "talk quill");
    await command(observer.client, "look");
    expect(
      observer.events
        .slice(before)
        .some(
          (event) =>
            event.payload.questId === "the-missing-pages" ||
            event.narration.includes("Blame is a poor bookmark"),
        ),
    ).toBe(false);
    expect(first.events.some((event) => event.type === "chat.said")).toBe(false);
    await command(first.client, "west");
    const failed = await new Promise<CommandAck>((resolve) =>
      first.client.emit(
        "command",
        { schemaVersion: 0, commandId: "bad-clue", raw: "x folded page", lastSequence: 0 },
        resolve,
      ),
    );
    expect(failed.status).toBe("rejected");
    expect((await progress())?.completedObjectiveIds).toEqual([]);
    await command(first.client, "x ink blotter");
    expect((await progress())?.completedObjectiveIds).toEqual(["read-blotter"]);

    await stop();
    const resumed = await connect(await start(), boot.sessionToken);
    for (const raw of ["east", "east", "north", "west", "x folded page", "east", "south", "west"])
      await command(resumed.client, raw);
    await command(resumed.client, "talk quill", "turn-in");
    expect(await progress()).toMatchObject({
      status: "completed",
      rewardGranted: true,
      completedObjectiveIds: ["read-blotter", "find-page", "report"],
    });
    expect((await auth.resolvePlayIdentity(boot.sessionToken))?.experience).toBe(10);
    const rewardIds = () =>
      new Set(
        resumed.events
          .filter((event) => event.type === "progress.experience_gained")
          .map((event) => event.eventId),
      );
    const rewards = rewardIds();
    await command(resumed.client, "talk quill", "turn-in");
    expect(rewardIds()).toEqual(rewards);
    expect((await auth.resolvePlayIdentity(boot.sessionToken))?.experience).toBe(10);

    await stop();
    const completed = await connect(await start(), boot.sessionToken);
    await command(completed.client, "talk quill");
    expect(completed.events.some((event) => event.type === "progress.experience_gained")).toBe(
      false,
    );
    expect((await auth.resolvePlayIdentity(boot.sessionToken))?.experience).toBe(10);
    await command(completed.client, "quests");
    expect(
      completed.events.some((event) => event.narration.includes("The Missing Pages (completed)")),
    ).toBe(true);
  });
});
