import {
  combatEndedEventSchema,
  eventEnvelopeSchema,
  experienceGainedEventSchema,
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

async function connectClient(port: number): Promise<Socket> {
  const client = ioClient(`http://127.0.0.1:${String(port)}`, {
    transports: ["websocket"],
  });
  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => {
      resolve();
    });
    client.once("connect_error", reject);
  });
  return client;
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

describe("combat socket round trip", () => {
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

  it("completes a practice-dummy fight through typed commands", async () => {
    app = await buildApp();
    await attachRealtime(app, createDevWorld());
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const events: EventEnvelope[] = [];
    client = await connectClient(address.port);
    client.on("event", (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (parsed.success) {
        events.push(parsed.data);
      }
    });

    const south = await emitCommand(client, "cmd-south", "south");
    expect(south.status).toBe("accepted");

    let attacks = 0;
    let ack = await emitCommand(client, "cmd-attack-0", "attack dummy");
    expect(ack.status).toBe("accepted");
    attacks += 1;
    while (!events.some((event) => event.type === "combat.ended") && attacks < 6) {
      ack = await emitCommand(client, `cmd-attack-${String(attacks)}`, "attack");
      expect(ack.status).toBe("accepted");
      attacks += 1;
    }

    const ended = events.find((event) => event.type === "combat.ended");
    expect(ended).toBeDefined();
    if (!ended) {
      return;
    }
    expect(combatEndedEventSchema.parse(ended).payload.outcome).toBe("victory");
    const xp = events.find((event) => event.type === "progress.experience_gained");
    expect(xp).toBeDefined();
    if (xp) {
      expect(experienceGainedEventSchema.parse(xp).narration).toBe("You gain 5 experience.");
    }
    expect(events.some((event) => event.type === "combat.started")).toBe(true);
    expect(events.some((event) => event.type === "combat.turn_started")).toBe(true);
    expect(events.some((event) => event.type === "combat.action_resolved")).toBe(true);
  });

  it("wakes the student in the Infirmary after a lost lesson", async () => {
    const world = createDevWorld();
    const dummy = world.enemies?.["enemy-practice-dummy-south-orchard"];
    if (!dummy) {
      throw new Error("expected dummy");
    }
    dummy.attack = 50;

    app = await buildApp();
    await attachRealtime(app, world);
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string") {
      throw new Error("expected a TCP address");
    }

    const events: EventEnvelope[] = [];
    client = await connectClient(address.port);
    client.on("event", (payload: unknown) => {
      const parsed = eventEnvelopeSchema.safeParse(payload);
      if (parsed.success) {
        events.push(parsed.data);
      }
    });

    expect((await emitCommand(client, "cmd-south-lose", "south")).status).toBe("accepted");
    expect((await emitCommand(client, "cmd-attack-lose", "attack dummy")).status).toBe("accepted");

    const ended = events.find((event) => event.type === "combat.ended");
    expect(ended).toBeDefined();
    if (!ended) {
      return;
    }
    expect(combatEndedEventSchema.parse(ended).payload).toMatchObject({
      outcome: "defeat",
      roomId: "infirmary",
    });
    const look = [...events].reverse().find((event) => event.type === "room.snapshot");
    expect(look?.narration).toContain("Infirmary");
  });
});
