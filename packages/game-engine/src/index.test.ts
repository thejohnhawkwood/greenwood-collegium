import { describe, expect, it } from "vitest";
import { contractsSchemaVersion, engineName } from "./engine-name.js";

describe("game-engine package", () => {
  it("is a named pure package", () => {
    expect(engineName).toBe("greenwood-game-engine");
    expect(contractsSchemaVersion()).toBe(0);
  });
});
