import { describe, expect, it } from "vitest";
import { schemaVersion, schemaVersionSchema } from "./index.js";

describe("contracts scaffold", () => {
  it("exposes schema version 0", () => {
    expect(schemaVersion).toBe(0);
    expect(schemaVersionSchema.parse(schemaVersion)).toBe(0);
  });
});
