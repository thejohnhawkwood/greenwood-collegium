import { useEffect } from "react";
import type { PlayState } from "@greenwood/contracts";

export function PrimerStage({
  primer,
  onSend,
}: {
  primer: NonNullable<PlayState["primer"]>;
  onSend: (command: string) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      const card = primer.cards.find((entry) => entry.command === event.key);
      if (!card) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (target.value.length > 0) {
          return;
        }
      }
      event.preventDefault();
      onSend(card.command);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSend, primer.cards]);
  return (
    <aside className="primer-stage" aria-label="Field Primer choices">
      <p className="primer-stage-eyebrow">Field Primer</p>
      <p className="primer-stage-prompt">{primer.prompt}</p>
      <div className="primer-cards">
        {primer.cards.map((card) => (
          <button
            key={card.command}
            type="button"
            className={`primer-card primer-card-${card.kind}`}
            aria-label={`Choose ${card.command}: ${card.title}. ${card.description}`}
            onClick={() => onSend(card.command)}
          >
            <span className="primer-card-index">{card.command}</span>
            <span className="primer-card-badge">{card.badge}</span>
            <strong className="primer-card-title">{card.title}</strong>
            <span className="primer-card-numbers">{card.numbers}</span>
            <span className="primer-card-description">{card.description}</span>
            {card.pennedBy ? <span className="primer-card-pen">{card.pennedBy}</span> : null}
          </button>
        ))}
      </div>
    </aside>
  );
}
