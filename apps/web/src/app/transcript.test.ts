import { describe, expect, it } from "vitest";
import { appendTranscript } from "./transcript.js";

describe("appendTranscript", () => {
  it("keeps earlier lines and appends the new one", () => {
    const first = { id: "1", kind: "command" as const, text: "look" };
    const second = { id: "2", kind: "narration" as const, text: "Lantern Court" };
    expect(appendTranscript([first], second)).toEqual([first, second]);
  });
});
