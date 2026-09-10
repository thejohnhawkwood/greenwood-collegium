import { describe, expect, it } from "vitest";
import { loadBundledWorld } from "./load.js";
import { questTemplateSchema } from "./quest-schema.js";
import { roomFileSchema, roomFixtureSchema } from "./schema.js";
import { validateQuests } from "./validate.js";
import { reservedCharacterNames } from "./character-creation.js";

const baseQuest = {
  id: "test-quest",
  title: "A Test",
  introNarration: "Begin.",
  reminderNarration: "Keep looking.",
  experienceReward: 10,
  giverNpcId: "npc-reader",
  completionNarration: "Well observed.",
  objectives: [
    { id: "read", kind: "examine", targetId: "object-note", label: "Read the note" },
    { id: "report", kind: "talk", targetId: "npc-reader", requires: ["read"], label: "Report" },
  ],
};

describe("adventure content", () => {
  it("offers six speaking staff and discoveries in every existing room", () => {
    const world = loadBundledWorld();
    const rooms = Object.values(world.rooms);
    expect(rooms).toHaveLength(25);
    const staff = rooms.flatMap((room) =>
      room.fixtures.filter((fixture) => fixture.kind === "npc"),
    );
    expect(staff).toHaveLength(6);
    for (const npc of staff) {
      expect(npc.dialogue).toBeTruthy();
      expect(reservedCharacterNames()).toContain(npc.name.toLowerCase());
    }
    for (const room of rooms) {
      expect(
        room.fixtures.some((fixture) => fixture.kind === "object" && fixture.examineDescription),
      ).toBe(true);
    }
    const adventures = Object.values(world.quests).filter((quest) => quest.giverNpcId);
    expect(adventures.map((quest) => quest.id).sort()).toEqual([
      "a-little-room-to-grow",
      "the-bell-below",
      "the-missing-pages",
    ]);
    for (const quest of adventures) {
      const report = quest.objectives.at(-1);
      expect(report?.targetId).toBe(quest.giverNpcId);
      expect(report?.requires).toEqual(
        quest.objectives.slice(0, -1).map((objective) => objective.id),
      );
      expect(quest.completionNarration).toBeTruthy();
    }
  });

  it("rejects markup, object dialogue, duplicate objectives, and impossible dependencies", () => {
    expect(
      roomFixtureSchema.safeParse({
        id: "npc-reader",
        name: "Reader",
        kind: "npc",
        dialogue: "<script>bad</script>",
      }).success,
    ).toBe(false);
    expect(
      roomFixtureSchema.safeParse({
        id: "object-note",
        name: "Note",
        kind: "object",
        dialogue: "Hello",
      }).success,
    ).toBe(false);
    for (const objectives of [
      [{ id: "read", kind: "examine", label: "Missing target" }],
      [{ id: "talk", kind: "talk", label: "Missing target" }],
      [baseQuest.objectives[0], baseQuest.objectives[0]],
      [{ ...baseQuest.objectives[0], requires: ["read"] }],
      [{ ...baseQuest.objectives[0], requires: ["report"] }, baseQuest.objectives[1]],
      [baseQuest.objectives[0], { ...baseQuest.objectives[1], requires: ["read", "read"] }],
    ])
      expect(questTemplateSchema.safeParse({ ...baseQuest, objectives }).success).toBe(false);
    expect(
      questTemplateSchema.safeParse({ ...baseQuest, completionNarration: "javascript:run()" })
        .success,
    ).toBe(false);
    expect(questTemplateSchema.safeParse(baseQuest).success).toBe(true);
  });

  it("validates quest givers, clue references, dialogue capability, and target room constraints", () => {
    const room = roomFileSchema.parse({
      id: "library",
      title: "Library",
      shortDescription: "Books.",
      longDescription: "Many books.",
      zone: "school",
      terminal: true,
      unmapped: true,
      exits: [],
      fixtures: [
        { id: "npc-reader", name: "Reader", kind: "npc", dialogue: "Welcome." },
        { id: "object-note", name: "Note", kind: "object" },
        { id: "npc-silent", name: "Silent", kind: "npc" },
      ],
    });
    const check = (input: unknown) =>
      validateQuests(
        [{ fileName: "library.json", room }],
        [],
        [{ fileName: "test-quest.json", template: questTemplateSchema.parse(input) }],
      );
    expect(check(baseQuest)).toEqual([]);
    expect(check({ ...baseQuest, giverNpcId: "object-note" })).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "missing_reference" })]),
    );
    expect(check({ ...baseQuest, giverNpcId: "npc-silent" })).toHaveLength(1);
    expect(
      check({
        ...baseQuest,
        objectives: [{ ...baseQuest.objectives[0], targetId: "object-missing" }],
      }),
    ).toHaveLength(1);
    expect(
      check({
        ...baseQuest,
        objectives: [{ id: "speak", kind: "talk", targetId: "object-note", label: "Speak" }],
      }),
    ).toHaveLength(1);
    expect(
      check({ ...baseQuest, objectives: [{ ...baseQuest.objectives[0], roomId: "elsewhere" }] }),
    ).not.toEqual([]);
  });
});
