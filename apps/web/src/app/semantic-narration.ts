import {
  renderClassicSegments,
  type EventEnvelope,
  type SemanticSegment,
} from "@greenwood/contracts";

export type SemanticTone = "narration" | "item" | "combat" | "quest" | "npc" | "player" | "system";
export function eventTone(event: EventEnvelope): SemanticTone {
  if (event.type.startsWith("combat.")) return "combat";
  if (event.type.startsWith("quest.") || event.presentationKey === "quest.journal") return "quest";
  if (event.type.startsWith("item.") || event.type === "inventory.updated") return "item";
  return "narration";
}
export function segmentTone(segment: SemanticSegment): SemanticTone {
  if (segment.entityKind) return segment.entityKind;
  if (segment.kind === "item" || segment.kind === "command") return "item";
  if (segment.kind === "damage" || segment.kind === "danger") return "combat";
  if (segment.kind === "quest") return "quest";
  return "narration";
}
export function safeSegments(event: EventEnvelope): SemanticSegment[] {
  return event.segments?.length && renderClassicSegments(event.segments) === event.narration
    ? event.segments
    : [{ kind: "text", text: event.narration }];
}
