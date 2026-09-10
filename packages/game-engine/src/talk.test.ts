import { eventEnvelopeSchema, renderClassicSegments } from "@greenwood/contracts";
import { describe, expect, it } from "vitest";
import { applyQuestProgress, listQuestRecords, progressQuests } from "./arrival.js";
import { parsePlayerCommand } from "./parse-command.js";
import { handleTalk } from "./talk.js";
import type { EngineRuntime, WorldState } from "./state.js";

function setup() {
  let sequence = 0;
  const runtime: EngineRuntime = {
    now: () => new Date("2026-09-10T12:00:00Z"),
    nextEventId: () => `event-${++sequence}`,
    nextSequence: () => ++sequence,
  };
  const world: WorldState = {
    rooms: {
      library: {
        id: "library",
        title: "Library",
        shortDescription: "Books.",
        longDescription: "Books and clues.",
        zone: "school",
        exits: [],
        fixtures: [
          {
            id: "npc-reader",
            name: "Reader Wren",
            kind: "npc",
            dialogue: "Notice before you guess.",
          },
          { id: "object-note", name: "Note", kind: "object", examineDescription: "A clue." },
        ],
      },
      elsewhere: {
        id: "elsewhere",
        title: "Elsewhere",
        shortDescription: "Away.",
        longDescription: "Away from the library.",
        zone: "school",
        exits: [],
        fixtures: [],
      },
    },
    characters: { rowan: { id: "rowan", name: "Rowan", roomId: "library", discoveredRoomIds: [] } },
    questTemplates: {
      investigation: {
        id: "investigation",
        title: "An Investigation",
        giverNpcId: "npc-reader",
        introNarration: "Find the note.",
        reminderNarration: "Read the note first.",
        completionNarration: "The mystery is solved.",
        experienceReward: 10,
        objectives: [
          {
            id: "read",
            kind: "examine",
            targetId: "object-note",
            roomId: "library",
            label: "Read the note",
          },
          {
            id: "report",
            kind: "talk",
            targetId: "npc-reader",
            requires: ["read"],
            label: "Report to Wren",
          },
        ],
      },
    },
  };
  const talk = (target = "wren", characterId = "rowan") =>
    handleTalk(world, { verb: "talk", characterId, target }, runtime);
  return { world, runtime, talk };
}

describe("authored NPC conversations", () => {
  it("parses talk and talk to, but requires a name", () => {
    for (const raw of ["talk Wren", "  TALK to Wren  "]) {
      expect(parsePlayerCommand(raw, "rowan")).toEqual({
        verb: "talk",
        target: "Wren",
        characterId: "rowan",
      });
    }
    for (const raw of ["talk", "talk to", "talkative Wren"])
      expect(parsePlayerCommand(raw, "rowan")).toBeNull();
  });

  it("starts once, reminds without restarting, and emits private plain-text dialogue with NPC colour", () => {
    const { world, talk } = setup();
    const result = talk();
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.message);
    expect(result.events.map((event) => event.type)).toEqual([
      "system.notice",
      "system.notice",
      "quest.updated",
    ]);
    for (const event of result.events) {
      expect(eventEnvelopeSchema.safeParse(event).success).toBe(true);
      expect(event.audience).toBe("character");
    }
    const greeting = result.events[0];
    expect(greeting?.segments?.[0]).toMatchObject({ kind: "actor", entityKind: "npc" });
    expect(renderClassicSegments(greeting?.segments ?? [])).toBe(greeting?.narration);
    const again = talk();
    expect(again.ok && again.events.map((event) => event.narration)).toContain(
      "Read the note first.",
    );
    expect(world.quests?.rowan?.investigation?.completedObjectiveIds).toEqual([]);
    expect(world.characters.rowan?.experience).toBeUndefined();
  });

  it("rejects absent, remote, object, and ambiguous targets without starting quests", () => {
    const { world, talk } = setup();
    expect(talk("wren", "missing")).toMatchObject({ ok: false, code: "character_not_found" });
    expect(talk("note")).toMatchObject({ ok: false, code: "npc_not_found" });
    const rowan = world.characters.rowan;
    if (!rowan) throw new Error("missing fixture");
    rowan.roomId = "elsewhere";
    expect(talk()).toMatchObject({ ok: false, code: "npc_not_found" });
    rowan.roomId = "library";
    world.rooms.library?.fixtures.push({
      id: "npc-other-reader",
      name: "Reader Finch",
      kind: "npc",
      dialogue: "Hello.",
    });
    expect(talk("reader")).toMatchObject({ ok: false, code: "npc_ambiguous" });
    expect(world.quests).toBeUndefined();
  });

  it("requires the exact clue after accepting, then a return conversation, and never grants twice after reload", () => {
    const { world, runtime, talk } = setup();
    const trigger = { characterId: "rowan", kind: "examine" as const, targetId: "object-note" };
    expect(progressQuests(world, trigger, runtime)).toEqual([]);
    talk();
    expect(progressQuests(world, { ...trigger, kind: "look" }, runtime)).toEqual([]);
    expect(progressQuests(world, { ...trigger, targetId: "another-note" }, runtime)).toEqual([]);
    const rowan = world.characters.rowan;
    if (!rowan) throw new Error("missing fixture");
    rowan.roomId = "elsewhere";
    expect(progressQuests(world, trigger, runtime)).toEqual([]);
    rowan.roomId = "library";
    progressQuests(world, trigger, runtime);
    expect(world.quests?.rowan?.investigation?.status).toBe("active");
    const completed = talk();
    expect(
      completed.ok &&
        completed.events.some((event) => event.narration.includes("The mystery is solved.")),
    ).toBe(true);
    expect(rowan.experience).toBe(10);
    applyQuestProgress(world, "rowan", listQuestRecords(world, "rowan"));
    const repeated = talk();
    expect(repeated.ok && repeated.events).toHaveLength(1);
    expect(progressQuests(world, trigger, runtime)).toEqual([]);
    expect(rowan.experience).toBe(10);
  });
});
