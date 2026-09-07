import type { EngineRuntime, WorldState } from "@greenwood/game-engine";
import { describe, expect, it } from "vitest";
import type { PlayIdentity } from "../auth/service.js";
import { InMemoryAuditRepository } from "../persistence/memory.js";
import { handleStaffCommand, muteRejection } from "./moderation.js";

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        title: "Lantern Court",
        shortDescription: "A courtyard.",
        longDescription: "Blue lanterns drift.",
        zone: "academy-core",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      "char-teacher": {
        id: "char-teacher",
        name: "Bramble the Hedgehog",
        accountUsername: "arbird",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
        level: 2,
        experience: 10,
      },
      "char-student": {
        id: "char-student",
        name: "Lumen the Otter",
        accountUsername: "noelle",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
        level: 1,
        experience: 0,
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  let event = 0;
  return {
    now: () => new Date("2026-09-07T22:10:00.000Z"),
    nextEventId: () => `evt-mod-${String((event += 1))}`,
    nextSequence: () => (sequence += 1),
  };
}

function teacher(): PlayIdentity {
  return {
    accountId: "acct-teacher",
    characterId: "char-teacher",
    characterName: "Bramble the Hedgehog",
    username: "arbird",
    role: "owner",
    roomId: "lantern-court",
    experience: 10,
    level: 2,
  };
}

function student(): PlayIdentity {
  return {
    accountId: "acct-student",
    characterId: "char-student",
    characterName: "Lumen the Otter",
    username: "noelle",
    role: "student",
    roomId: "lantern-court",
    experience: 0,
    level: 1,
  };
}

describe("classroom moderation", () => {
  it("refuses students and lets a teacher announce, inspect, mute, and audit", async () => {
    const state = world();
    const audit = new InMemoryAuditRepository();
    const mutedUntil = new Map<string, number>();
    const identities = new Map<string, PlayIdentity>([
      ["char-teacher", teacher()],
      ["char-student", student()],
    ]);
    const clock = runtime();
    const now = () => new Date("2026-09-07T22:10:00.000Z");
    const studentAttempt = await handleStaffCommand(
      { verb: "announce", characterId: "char-student", text: "Hello class." },
      {
        world: state,
        actorId: "char-student",
        identity: student(),
        runtime: clock,
        onlineCharacterIds: ["char-teacher", "char-student"],
        mutedUntil,
        identities,
        audit,
        now,
      },
    );
    expect(studentAttempt).toMatchObject({ ok: false, code: "forbidden" });

    const announced = await handleStaffCommand(
      { verb: "announce", characterId: "char-teacher", text: "The lanterns are lit." },
      {
        world: state,
        actorId: "char-teacher",
        identity: teacher(),
        runtime: clock,
        onlineCharacterIds: ["char-teacher", "char-student"],
        mutedUntil,
        identities,
        audit,
        now,
      },
    );
    expect(announced.ok).toBe(true);
    if (announced.ok) {
      expect(announced.events[0]?.narration).toBe("A teacher announces: The lanterns are lit.");
      expect(announced.notices[0]?.event.narration).toBe(
        "A teacher announces: The lanterns are lit.",
      );
    }

    const inspected = await handleStaffCommand(
      { verb: "inspect", characterId: "char-teacher", target: "noelle" },
      {
        world: state,
        actorId: "char-teacher",
        identity: teacher(),
        runtime: clock,
        onlineCharacterIds: ["char-teacher", "char-student"],
        mutedUntil,
        identities,
        audit,
        now,
      },
    );
    expect(inspected.ok).toBe(true);
    if (inspected.ok) {
      expect(inspected.events[0]?.narration).toContain("Lumen the Otter is in Lantern Court");
      expect(inspected.events[0]?.narration).toContain("Login: noelle");
    }

    const muted = await handleStaffCommand(
      { verb: "mute", characterId: "char-teacher", target: "lumen", minutes: 10 },
      {
        world: state,
        actorId: "char-teacher",
        identity: teacher(),
        runtime: clock,
        onlineCharacterIds: ["char-teacher", "char-student"],
        mutedUntil,
        identities,
        audit,
        now,
      },
    );
    expect(muted.ok).toBe(true);
    expect(mutedUntil.get("char-student")).toBe(Date.parse("2026-09-07T22:20:00.000Z"));
    expect(
      muteRejection(mutedUntil.get("char-student") ?? 0, Date.parse("2026-09-07T22:10:00.000Z")),
    ).toContain("muted");

    const log = await handleStaffCommand(
      { verb: "audit", characterId: "char-teacher" },
      {
        world: state,
        actorId: "char-teacher",
        identity: teacher(),
        runtime: clock,
        onlineCharacterIds: ["char-teacher", "char-student"],
        mutedUntil,
        identities,
        audit,
        now,
      },
    );
    expect(log.ok).toBe(true);
    if (log.ok) {
      expect(log.events[0]?.narration).toContain("announce");
      expect(log.events[0]?.narration).toContain("inspect");
      expect(log.events[0]?.narration).toContain("mute");
    }
  });
});
