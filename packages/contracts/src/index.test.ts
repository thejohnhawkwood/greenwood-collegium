import { describe, expect, it } from "vitest";
import { schemaVersion, schemaVersionSchema } from "./index.js";

describe("schema version", () => {
  it("is generation 0", () => {
    expect(schemaVersion).toBe(0);
    expect(schemaVersionSchema.parse(schemaVersion)).toBe(0);
  });
});
