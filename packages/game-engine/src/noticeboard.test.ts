import { describe, expect, it } from "vitest";
import { createPlayState } from "./play-state.js";
import { handleSeek, noticeboardPosts } from "./noticeboard.js";
import { parseSeekCommand } from "./parse-seek.js";
import type { EngineRuntime, WorldState } from "./state.js";

function world(): WorldState {
  return {
    rooms: {
      "lantern-court": {
        id: "lantern-court",
        map: { x: 0, y: 0 },
        title: "Lantern Court",
        shortDescription: "Court.",
        longDescription: "A court.",
        zone: "academy",
        exits: [],
        fixtures: [
          { id: "object-noticeboard", name: "Noticeboard", kind: "object" },
          { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
        ],
      },
      "library-stacks": {
        id: "library-stacks",
        map: { x: -2, y: 0 },
        title: "Library Stacks",
        shortDescription: "Stacks.",
        longDescription: "Quiet stacks.",
        zone: "academy",
        exits: [],
        fixtures: [{ id: "npc-librarian-quill", name: "Librarian Quill", kind: "npc" }],
      },
      "great-hall": {
        id: "great-hall",
        map: { x: 0, y: 1 },
        title: "Great Hall",
        shortDescription: "Hall.",
        longDescription: "A hall.",
        zone: "academy",
        exits: [],
        fixtures: [],
      },
    },
    characters: {
      self: {
        id: "self",
        name: "Fern",
        roomId: "lantern-court",
        discoveredRoomIds: ["lantern-court"],
      },
    },
    questTemplates: {
      pages: {
        id: "pages",
        title: "The Missing Pages",
        introNarration: "Quill needs a reader.",
        reminderNarration: "Examine the Ink Blotter. Then talk quill.",
        giverNpcId: "npc-librarian-quill",
        experienceReward: 10,
        objectives: [{ id: "read", kind: "examine", label: "Examine the Ink Blotter." }],
      },
      later: {
        id: "later",
        title: "The Meadow Fork",
        introNarration: "Wren is east.",
        reminderNarration: "Talk Wren after the queen.",
        giverNpcId: "npc-shepherd-wren",
        requiresQuestIds: ["pages"],
        experienceReward: 10,
        objectives: [{ id: "talk", kind: "talk", label: "Talk Wren." }],
      },
      lesson: {
        id: "lesson",
        title: "First Lessons: Ember",
        introNarration: "Look at the hearth.",
        reminderNarration: "Defeat the dummy.",
        experienceReward: 10,
        objectives: [
          {
            id: "look-hearth",
            kind: "look",
            label: "Look around the hearth.",
            roomId: "great-hall",
          },
        ],
      },
    },
    quests: {
      self: {
        lesson: {
          questId: "lesson",
          status: "active",
          completedObjectiveIds: [],
          rewardGranted: false,
        },
      },
    },
  };
}

function runtime(): EngineRuntime {
  let sequence = 0;
  return {
    now: () => new Date("2026-09-23T16:00:00Z"),
    nextEventId: () => "evt-seek",
    nextSequence: () => ++sequence,
  };
}

describe("noticeboard", () => {
  it("parses seek", () => {
    expect(parseSeekCommand("seek Librarian Quill", "self")).toEqual({
      verb: "seek",
      characterId: "self",
      target: "Librarian Quill",
    });
    expect(parseSeekCommand("seek", "self")?.target).toBe("");
  });

  it("lists open work and hides what is finished or not yet earned", () => {
    const realm = world();
    const posts = noticeboardPosts(realm, realm.characters.self!);
    expect(posts.map((post) => post.title)).toEqual(["First Lessons: Ember", "The Missing Pages"]);
    expect(posts[1]?.command).toBe("seek Librarian Quill");
    expect(posts[0]?.command).toBe("seek Great Hall");
    realm.quests!.self!.pages = {
      questId: "pages",
      status: "completed",
      completedObjectiveIds: ["read"],
      rewardGranted: true,
    };
    expect(noticeboardPosts(realm, realm.characters.self!).map((post) => post.title)).toEqual([
      "First Lessons: Ember",
    ]);
    const played = createPlayState(realm, "self");
    expect(played?.noticeboard?.posts.some((post) => post.title === "The Meadow Fork")).toBe(false);
  });

  it("sends you to the giver and discovers only that room", () => {
    const realm = world();
    const result = handleSeek(
      realm,
      { verb: "seek", characterId: "self", target: "Quill" },
      runtime(),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(realm.characters.self?.roomId).toBe("library-stacks");
    expect(realm.characters.self?.discoveredRoomIds).toEqual(["lantern-court", "library-stacks"]);
    expect(result.events[0]?.narration).toContain("Library Stacks");
    expect(result.events[0]?.narration).toContain("Librarian Quill");
    const again = handleSeek(
      realm,
      { verb: "seek", characterId: "self", target: "Quill" },
      runtime(),
    );
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.code).toBe("not_at_board");
  });
});
