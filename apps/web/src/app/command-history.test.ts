import { describe, expect, it } from "vitest";
import { pushCommandHistory, recallCommandHistory } from "./command-history.js";

describe("command history", () => {
  it("ignores blank lines and recalls with up and down", () => {
    const entries = pushCommandHistory(pushCommandHistory(["look"], "   "), "l");
    expect(entries).toEqual(["look", "l"]);

    const upFromDraft = recallCommandHistory(entries, null, "", "partial", "up");
    expect(upFromDraft).toEqual({ cursor: 1, draft: "partial", value: "l" });

    const upAgain = recallCommandHistory(entries, 1, "partial", "l", "up");
    expect(upAgain).toEqual({ cursor: 0, draft: "partial", value: "look" });

    const down = recallCommandHistory(entries, 0, "partial", "look", "down");
    expect(down).toEqual({ cursor: 1, draft: "partial", value: "l" });

    const backToDraft = recallCommandHistory(entries, 1, "partial", "l", "down");
    expect(backToDraft).toEqual({ cursor: null, draft: "partial", value: "partial" });
  });
});
