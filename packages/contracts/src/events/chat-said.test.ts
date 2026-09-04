import { describe, expect, it } from "vitest";
import { chatSaidEventSchema, formatChatSaidText } from "./chat-said.js";

describe("chat.said contract", () => {
  it("renders you-say and they-say from the same payload", () => {
    const event = chatSaidEventSchema.parse({
      eventId: "evt-say-1",
      sequence: 1,
      schemaVersion: 0,
      type: "chat.said",
      occurredAt: "2026-09-03T21:00:00.000Z",
      audience: "character",
      roomId: "lantern-court",
      narration: 'You say, "Meet me in the library."',
      payload: {
        speakerId: "char-rowan",
        speakerName: "Rowan the Hare",
        roomId: "lantern-court",
        text: "Meet me in the library.",
      },
    });

    expect(formatChatSaidText(event.payload, "char-rowan")).toBe(event.narration);
    expect(formatChatSaidText(event.payload, "char-moss")).toBe(
      'Rowan the Hare says, "Meet me in the library."',
    );
  });
});
