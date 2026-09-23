import type { PlayState } from "@greenwood/contracts";
import { useEffect } from "react";

export function DuelPrompt({
  conversation,
  onSend,
}: {
  conversation: NonNullable<PlayState["conversation"]>;
  onSend: (command: string) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.querySelector(".bag-overlay, .primer-overlay, .world-map-overlay")) return;
      onSend("duel decline");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSend]);
  return (
    <div className="duel-overlay" role="presentation">
      <div className="duel-dialog" role="dialog" aria-labelledby="duel-heading" aria-modal="true">
        <h2 id="duel-heading">Classroom duel</h2>
        <p className="duel-speaker">{conversation.npcName}</p>
        <p>{conversation.prompt}</p>
        <div className="duel-actions">
          <button type="button" onClick={() => onSend("duel accept")}>
            Accept the duel
          </button>
          <button type="button" onClick={() => onSend("duel decline")}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
