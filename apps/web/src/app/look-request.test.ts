import { describe, expect, it } from "vitest";
import { createLookRequest } from "./look-request.js";

describe("createLookRequest", () => {
  it("does not include a client-chosen character", () => {
    const request = createLookRequest("cmd-1");
    expect(request.raw).toBe("look");
    expect(request).not.toHaveProperty("characterId");
  });
});
