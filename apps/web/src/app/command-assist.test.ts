import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, type PlayState } from "@greenwood/contracts";
import {
  completeCommand,
  completionCandidates,
  reminderWords,
  shortcutForKey,
} from "./command-assist.js";

const state: PlayState = {
  character: {
    id: "self",
    name: "Fern",
    visual: { speciesId: "fox", appearance: DEFAULT_APPEARANCE },
    health: 20,
    maxHealth: 20,
    focus: 10,
    maxFocus: 10,
    level: 1,
    experience: 0,
    inCombat: false,
    gifts: [],
  },
  peers: [],
  bag: [{ id: "item-key", name: "Small Copper Key", equipped: false }],
  conversation: {
    npcId: "npc-porter-bramble",
    npcName: "Porter Bramble",
    prompt: "Why a weapon, I wonder?",
    choices: [{ say: "1", label: "Why does a weapon fit?" }],
  },
  minimap: {
    rooms: [{ id: "court", title: "Lantern Court", x: 0, y: 0, state: "current" }],
    paths: [],
  },
  room: {
    roomId: "court",
    title: "Lantern Court",
    shortDescription: "Lanterns.",
    longDescription: "Lanterns overhead.",
    zone: "academy",
    exits: [],
    visible: [{ id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" }],
  },
};

describe("command assistance", () => {
  it("completes a unique first word and the shared prefix of several", () => {
    expect(completeCommand("tr")).toEqual({ value: "travel", matches: ["travel"] });
    expect(completeCommand("t")).toEqual({
      value: "t",
      matches: ["take", "talk", "travel"],
    });
    expect(completeCommand("say ", ["hello", "1"])).toEqual({
      value: "say ",
      matches: [],
    });
    expect(completeCommand("say 1", ["1", "2"])).toEqual({
      value: "say 1",
      matches: ["1"],
    });
  });

  it("lists legal reminder words and conversation replies", () => {
    expect(reminderWords(state).map((entry) => entry.word)).toEqual([
      "look",
      "say",
      "talk",
      "take",
      "travel",
      "help",
      "say 1",
      "bye",
    ]);
    expect(reminderWords(state).find((entry) => entry.word === "look")).toMatchObject({
      send: true,
      shortcut: "l",
    });
    expect(reminderWords(state).find((entry) => entry.word === "say")).toMatchObject({
      send: false,
      shortcut: "s",
    });
    expect(shortcutForKey("L")?.word).toBe("look");
    expect(shortcutForKey("s")?.word).toBe("say");
    expect(completionCandidates(state)).toEqual(
      expect.arrayContaining(["1", "Why does a weapon fit?", "Small Copper Key", "Porter Bramble"]),
    );
  });
});
