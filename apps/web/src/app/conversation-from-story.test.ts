import { describe, expect, it } from "vitest";
import { conversationFromStory } from "./conversation-from-story.js";

describe("conversation from story", () => {
  it("reads Porter choices out of the classic talk notice", () => {
    expect(
      conversationFromStory([
        { text: "You arrive." },
        {
          text: [
            "Porter Bramble",
            "",
            '"The animals are trained. Typed commands are how you learn."',
            "",
            "Type say 1 — What should I type first?",
            "Type say 2 — Why does the Greenwood matter?",
            "Type say 3 — I am ready to walk.",
          ].join("\n"),
        },
      ]),
    ).toEqual({
      npcId: "story",
      npcName: "Porter Bramble",
      prompt: '"The animals are trained. Typed commands are how you learn."',
      choices: [
        { say: "1", label: "What should I type first?" },
        { say: "2", label: "Why does the Greenwood matter?" },
        { say: "3", label: "I am ready to walk." },
      ],
    });
  });
});
