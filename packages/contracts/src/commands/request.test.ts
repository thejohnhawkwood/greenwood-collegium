import { describe, expect, it } from "vitest";
import { commandRequestSchema } from "./request.js";

describe("command request", () => {
  it("accepts a look line and strips client identity fields", () => {
    const parsed = commandRequestSchema.parse({
      schemaVersion: 0,
      commandId: "cmd-1",
      raw: "look",
      lastSequence: 0,
      characterId: "forged-id",
    });

    expect(parsed.raw).toBe("look");
    expect(parsed.interfaceMode).toBe("classic");
    expect(parsed).not.toHaveProperty("characterId");
  });

  it("rejects oversized input", () => {
    expect(() => {
      commandRequestSchema.parse({
        schemaVersion: 0,
        commandId: "cmd-1",
        raw: "x".repeat(201),
        lastSequence: 0,
      });
    }).toThrow();
  });
});
