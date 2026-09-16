import { describe, expect, it } from "vitest";
import { isDialogueMenuText } from "./conversation-from-story.js";

describe("dialogue menu text", () => {
  it("hides printed say-menus from the story log", () => {
    expect(isDialogueMenuText("Type say 1 — What should I type first?")).toBe(true);
    expect(isDialogueMenuText("Blue lanterns drift beneath the oak.")).toBe(false);
  });
});
