import { describe, expect, it } from "vitest";
import { nextOpeningScroll, openingScrollPaused, stepAfterInvite } from "./opening-story.js";

describe("student opening", () => {
  it("shows the story only after a student invite, then the account form", () => {
    expect(stepAfterInvite("student")).toBe("story");
    expect(stepAfterInvite("teacher")).toBe("account");
  });

  it("scrolls the story until the reader moves back", () => {
    expect(nextOpeningScroll(0, 400, 100, false)).toBe(1);
    expect(nextOpeningScroll(300, 400, 100, false)).toBe(300);
    expect(nextOpeningScroll(10, 400, 100, true)).toBe(10);
    expect(openingScrollPaused(40, 10)).toBe(true);
    expect(openingScrollPaused(40, 39)).toBe(false);
  });
});
