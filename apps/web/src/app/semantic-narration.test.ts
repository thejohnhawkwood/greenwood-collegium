import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { EventEnvelope } from "@greenwood/contracts";
import { eventTone, safeSegments, segmentTone } from "./semantic-narration.js";
import { SemanticNarration } from "./SemanticNarration.js";
import { readFileSync } from "node:fs";
const tokens = readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8");

const event: EventEnvelope = {
  eventId: "fictional",
  sequence: 1,
  schemaVersion: 0,
  type: "room.snapshot",
  occurredAt: "2026-09-10T18:00:00Z",
  audience: "character",
  narration: "Porter Bramble",
  segments: [{ kind: "actor", entityKind: "npc", text: "Porter Bramble" }],
  payload: {},
};
describe("semantic transcript", () => {
  it("uses explicit entity kinds, with visible NPC and PC labels", () => {
    const npc = renderToStaticMarkup(createElement(SemanticNarration, { event }));
    expect(npc).toContain("semantic-npc");
    expect(npc).toContain("[NPC]");
    expect(segmentTone({ kind: "actor", text: "Hazel", entityKind: "player" })).toBe("player");
    expect(segmentTone({ kind: "actor", text: "Unknown" })).toBe("narration");
    expect(segmentTone({ kind: "item", text: "Key" })).toBe("item");
  });
  it("colours combat and quests by category and keeps ordinary speech neutral", () => {
    expect(eventTone({ ...event, type: "combat.action_resolved" })).toBe("combat");
    expect(eventTone({ ...event, type: "quest.updated" })).toBe("quest");
    expect(eventTone({ ...event, type: "system.notice", presentationKey: "quest.journal" })).toBe(
      "quest",
    );
    expect(eventTone({ ...event, type: "chat.said", narration: "combat quest Key Porter" })).toBe(
      "narration",
    );
  });
  it("falls back to intact narration if semantic segments are absent or inconsistent", () => {
    expect(safeSegments({ ...event, segments: undefined })).toEqual([
      { kind: "text", text: event.narration },
    ]);
    expect(safeSegments({ ...event, narration: "Complete authoritative narration" })).toEqual([
      { kind: "text", text: "Complete authoritative narration" },
    ]);
  });
  it("escapes user content instead of turning chat text into markup", () => {
    const html = renderToStaticMarkup(
      createElement(SemanticNarration, {
        event: {
          ...event,
          type: "chat.said",
          narration: "<script>fictional</script>",
          segments: undefined,
        },
      }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
  it("keeps every semantic foreground at least 4.5:1 against the actual transcript background", () => {
    function colour(token: string): number[] {
      const hex = new RegExp(`--${token}:\\s*#([0-9a-f]{6})`, "i").exec(tokens)?.[1];
      if (!hex) throw new Error(`Missing colour ${token}`);
      return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
    }
    function luminance(rgb: number[]): number {
      return rgb
        .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
        .reduce((sum, value, index) => sum + value * ([0.2126, 0.7152, 0.0722][index] ?? 0), 0);
    }
    const background = luminance(colour("well"));
    for (const token of [
      "text-narration",
      "text-item",
      "text-combat",
      "text-npc",
      "text-player",
      "text-quest",
    ])
      expect((luminance(colour(token)) + 0.05) / (background + 0.05)).toBeGreaterThanOrEqual(4.5);
  });
});
