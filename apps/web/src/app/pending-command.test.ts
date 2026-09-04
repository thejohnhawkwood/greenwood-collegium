import { describe, expect, it } from "vitest";
import { pendingAfterAck } from "./pending-command.js";

describe("pending command", () => {
  it("clears only the acknowledged command", () => {
    const pending = { commandId: "cmd-1", raw: "north" };
    expect(pendingAfterAck(pending, "cmd-1")).toBeUndefined();
    expect(pendingAfterAck(pending, "cmd-2")).toEqual(pending);
  });
});
