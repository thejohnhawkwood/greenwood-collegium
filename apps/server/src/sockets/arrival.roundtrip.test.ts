import {
  eventEnvelopeSchema,
  experienceGainedEventSchema,
  levelGainedEventSchema,
  questUpdatedEventSchema,
  type EventEnvelope,
} from "@greenwood/contracts";
import { afterEach, describe, expect, it } from "vitest";
import { io as ioClient, type Socket } from "socket.io-client";
import { createDevWorld } from "../application/dev-world.js";
import { buildApp } from "../app.js";
import { attachRealtime } from "./gateway.js";

type CommandAck = {
  commandId: string;
  status: string;
  errorCode?: string;
  message?: string;
};

async function connectClient(port: number): Promise<{ client: Socket; events: EventEnvelope[] }> {
  const events: EventEnvelope[] = [];
  const client = ioClient(`http://127.0.0.1:${String(port)}`, {
    transports: ["websocket"],
  });
  client.on("event", (payload: unknown) => {
    const parsed = eventEnvelopeSchema.safeParse(payload);
    if (parsed.success) {
      events.push(parsed.data);
    }
  });
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => {
      resolve();
    });
    client.once("connect_error", reject);
  });
  return { client, events };
}

function emitCommand(client: Socket, commandId: string, raw: string): Promise<CommandAck> {
  return new Promise((resolve) => {
    client.emit(
      "command",
      { schemaVersion: 0, commandId, raw, lastSequence: 0, characterId: "forged" },
      resolve,
    );
  });
}

async function waitFor(
  events: EventEnvelope[],
  type: EventEnvelope["type"],
): Promise<EventEnvelope> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const found = events.find((event) => event.type === type);
    if (found) {
      return found;
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 25);
    });
  }
  throw new Error(`timed out waiting for ${type}`);
}

describe("arrival socket round trip", () => {
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

  it("lets Porter greet a student, teach help, and finish Arrival once", async () => {
    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const connected = await connectClient(address.port);
    client = connected.client;
    const { events } = connected;

    const intro = await waitFor(events, "system.notice");
    expect(intro.narration).toContain("Porter Bramble");
    expect(intro.narration).toContain("help");
    expect(intro.narration).toContain("look");
    const started = questUpdatedEventSchema.parse(await waitFor(events, "quest.updated"));
    expect(started.payload.questId).toBe("arrival-at-the-collegium");
    expect(started.payload.completedObjectives).toEqual([]);

    const help = await emitCommand(client, "cmd-help", "help");
    expect(help.status).toBe("accepted");
    expect(
      events.some((event) => event.narration.includes("The Collegium understands these words")),
    ).toBe(true);

    const topic = await emitCommand(client, "cmd-help-look", "help look");
    expect(topic.status).toBe("accepted");
    expect(events.some((event) => event.narration.includes("look describes the room"))).toBe(true);

    expect((await emitCommand(client, "cmd-look", "look")).status).toBe("accepted");
    expect((await emitCommand(client, "cmd-say", "say hello")).status).toBe("accepted");
    expect((await emitCommand(client, "cmd-take", "take Small Copper Key")).status).toBe(
      "accepted",
    );
    expect((await emitCommand(client, "cmd-north", "north")).status).toBe("accepted");

    const completed = [...events].reverse().find((event) => event.type === "quest.updated");
    expect(completed).toBeDefined();
    if (completed) {
      expect(questUpdatedEventSchema.parse(completed).payload.status).toBe("completed");
    }
    const xp = events.find((event) => event.type === "progress.experience_gained");
    expect(xp).toBeDefined();
    if (xp) {
      expect(experienceGainedEventSchema.parse(xp).payload).toMatchObject({
        amount: 10,
        total: 10,
      });
    }
    const level = events.find((event) => event.type === "progress.level_gained");
    expect(level).toBeDefined();
    if (level) {
      expect(levelGainedEventSchema.parse(level).payload.level).toBe(2);
    }

    const before = events.filter((event) => event.type === "progress.experience_gained").length;
    expect((await emitCommand(client, "cmd-look-again", "look")).status).toBe("accepted");
    expect((await emitCommand(client, "cmd-say-again", "say hello")).status).toBe("accepted");
    expect(events.filter((event) => event.type === "progress.experience_gained")).toHaveLength(
      before,
    );

    const listed = await emitCommand(client, "cmd-quests", "quests");
    expect(listed.status).toBe("accepted");
    expect(
      events.some((event) => event.narration.includes("Arrival at the Collegium (completed)")),
    ).toBe(true);
  });
});
