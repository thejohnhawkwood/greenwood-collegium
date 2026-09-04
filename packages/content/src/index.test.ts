import { describe, expect, it } from "vitest";
import { contentReady } from "./index.js";

describe("content scaffold", () => {
  it("is not ready in Ticket 001", () => {
    expect(contentReady).toBe(false);
  });
});
