import { describe, expect, it } from "vitest";
import { createCommandRequest } from "./command-request.js";

describe("createCommandRequest", () => {
  it("sends the typed line without a client-chosen character", () => {
    const request = createCommandRequest("cmd-1", "look", 3);
    expect(request.raw).toBe("look");
    expect(request.lastSequence).toBe(3);
    expect(request.interfaceMode).toBe("classic");
    expect(request).not.toHaveProperty("characterId");
  });
});
