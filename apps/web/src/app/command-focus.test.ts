import { describe, expect, it } from "vitest";
import { shouldFocusCommandInput } from "./command-focus.js";

describe("command focus", () => {
  it("leaves buttons, fields, and labels alone so the prompt does not steal them", () => {
    expect(shouldFocusCommandInput({ closest: () => ({}) })).toBe(false);
    expect(shouldFocusCommandInput({ closest: () => null })).toBe(true);
    expect(shouldFocusCommandInput(null)).toBe(true);
  });

  it("does not steal focus when clicking or selecting earlier transcript text", () => {
    expect(
      shouldFocusCommandInput({
        closest: (selectors) => (selectors.includes('[role="log"]') ? {} : null),
      }),
    ).toBe(false);
  });
});
