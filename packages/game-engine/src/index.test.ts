import { describe, expect, it } from "vitest";
import { contractsSchemaVersion, engineName } from "./index.js";

describe("game-engine scaffold", () => {
  it("is a named pure package", () => {
    expect(engineName).toBe("greenwood-game-engine");
    expect(contractsSchemaVersion()).toBe(0);
  });
});
