import { describe, expect, it } from "vitest";
import { conversationChoice } from "./conversation.js";
import type { DialogueNode } from "./state.js";

const node: DialogueNode = {
  text: "Which weapon?",
  choices: [
    { say: "1", label: "Why does a weapon fit?", next: "fit" },
    { say: "2", label: "How do I practice?", next: "practice" },
  ],
};

describe("conversationChoice", () => {
  it("matches the number alone or with the printed label", () => {
    expect(conversationChoice(node, "1")?.next).toBe("fit");
    expect(conversationChoice(node, "1 - Why does a weapon fit?")?.next).toBe("fit");
    expect(conversationChoice(node, "1 — Why does a weapon fit?")?.next).toBe("fit");
    expect(conversationChoice(node, "Why does a weapon fit?")?.next).toBe("fit");
    expect(conversationChoice(node, "hello")).toBeUndefined();
  });
});
