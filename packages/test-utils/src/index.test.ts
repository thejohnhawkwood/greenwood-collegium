import { describe, expect, it } from "vitest";
import { expectDefined } from "./index.js";

describe("test-utils scaffold", () => {
  it("returns defined values", () => {
    expect(expectDefined("lantern")).toBe("lantern");
  });

  it("throws on undefined", () => {
    expect(() => {
      expectDefined(undefined);
    }).toThrow(/defined/);
  });
});
