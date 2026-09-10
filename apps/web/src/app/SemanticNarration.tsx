import type { EventEnvelope } from "@greenwood/contracts";
import { eventTone, safeSegments, segmentTone } from "./semantic-narration.js";

export function SemanticNarration({ event }: { event: EventEnvelope }) {
  const tone = eventTone(event);
  const wholeMessage = tone === "combat" || tone === "quest";
  const label =
    tone === "combat"
      ? "COMBAT"
      : tone === "quest"
        ? "QUEST"
        : tone === "item"
          ? "ITEM"
          : undefined;
  return (
    <span className={`semantic-${wholeMessage ? tone : "narration"}`}>
      {label ? <span className="semantic-label">[{label}] </span> : null}
      {safeSegments(event).map((segment, index) => (
        <span key={index} className={wholeMessage ? undefined : `semantic-${segmentTone(segment)}`}>
          {segment.text}
          {!wholeMessage && segment.entityKind ? (
            <span className="semantic-role"> [{segment.entityKind === "npc" ? "NPC" : "PC"}]</span>
          ) : null}
        </span>
      ))}
    </span>
  );
}
