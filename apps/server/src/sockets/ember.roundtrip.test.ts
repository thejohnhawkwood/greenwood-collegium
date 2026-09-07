import {
  combatActionResolvedEventSchema,
  combatStatusAppliedEventSchema,
  eventEnvelopeSchema,
  renderClassicNarration,
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

describe("ember socket round trip", () => {
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

  it("explains Ember in the classic transcript without animation", async () => {
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

    expect((await emitCommand(client, "cmd-south-ember", "south")).status).toBe("accepted");
    expect((await emitCommand(client, "cmd-cast-ember", "cast ember dummy")).status).toBe(
      "accepted",
    );

    const ember = events.find(
      (event) =>
        event.type === "combat.action_resolved" &&
        typeof event.payload === "object" &&
        event.payload !== null &&
        "verb" in event.payload &&
        event.payload.verb === "cast",
    );
    expect(ember).toBeDefined();
    if (!ember) {
      return;
    }
    const parsed = combatActionResolvedEventSchema.parse(ember);
    expect(parsed.presentationKey).toBe("ember-burst");
    expect(renderClassicNarration(parsed)).toBe(
      "You cast Ember at the Practice Dummy for 5. It has 3 remaining.",
    );
    const burning = events.find((event) => event.type === "combat.status_applied");
    expect(burning && combatStatusAppliedEventSchema.parse(burning).narration).toBe(
      "The Practice Dummy is burning (2 rounds).",
    );
  });
});
