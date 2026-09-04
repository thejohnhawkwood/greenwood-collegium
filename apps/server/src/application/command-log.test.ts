import { describe, expect, it } from "vitest";
import { CommandLog } from "./command-log.js";

describe("CommandLog", () => {
  it("returns the first result for a repeated command id", () => {
    const log = new CommandLog();
    const first = {
      ack: {
        commandId: "cmd-north-1",
        status: "accepted" as const,
        message: "north",
        resyncRequired: false,
      },
      events: [],
      notices: [],
    };
    log.set("char-rowan", "cmd-north-1", first);
    expect(log.get("char-rowan", "cmd-north-1")).toBe(first);
    expect(log.get("char-rowan", "cmd-south-1")).toBeUndefined();
  });
});
