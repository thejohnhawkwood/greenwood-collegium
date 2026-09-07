import { describe, expect, it } from "vitest";
import { classroomCommandFields, redactLogFields, safeErrorMessage } from "./safe-log.js";

describe("safe logs", () => {
  it("redacts secrets and database URLs, and never keeps command text", () => {
    expect(safeErrorMessage(new Error("connect postgres://greenwood:x@localhost/db"))).toBe(
      "connect [redacted]",
    );
    expect(redactLogFields({ ticket: "abc", verb: "look", raw: "say hello" })).toEqual({
      verb: "look",
    });
    expect(
      classroomCommandFields({
        commandId: "cmd-1",
        verb: "say",
        status: "accepted",
        durationMs: 12,
        characterId: "char-pip",
        connected: 8,
      }),
    ).toMatchObject({ event: "command", verb: "say", connected: 8 });
  });
});
