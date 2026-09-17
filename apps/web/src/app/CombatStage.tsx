import type { PlayState } from "@greenwood/contracts";
import { useEffect, useState } from "react";

export function secondsLeft(lockDeadlineAt: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(lockDeadlineAt) - now) / 1000));
}

export function CombatStage({
  encounter,
  onSend,
}: {
  encounter: NonNullable<PlayState["encounter"]>;
  onSend: (command: string) => void;
}) {
  const [remaining, setRemaining] = useState(() => secondsLeft(encounter.lockDeadlineAt));
  useEffect(() => {
    const tick = () => {
      setRemaining(secondsLeft(encounter.lockDeadlineAt));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [encounter.lockDeadlineAt, encounter.round]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      const index = Number(event.key) - 1;
      const move = encounter.moves[index];
      if (!move || index < 0 || index > 8) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        if (target.value.length > 0) {
          return;
        }
      }
      event.preventDefault();
      onSend(move.command);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [encounter.moves, onSend]);
  const foe = encounter.enemy;
  return (
    <aside className="combat-stage" aria-label={`Fighting ${foe.name}`}>
      <p className="combat-stage-round">Round {encounter.round}</p>
      <p className="combat-stage-foe">{foe.name}</p>
      <p className="combat-stage-vitals">
        Health {foe.health} / {foe.maxHealth}
      </p>
      <p className="combat-stage-vitals">
        Focus {foe.focus} / {foe.maxFocus}
      </p>
      <p className="combat-stage-clock" aria-live="polite">
        {remaining > 0 ? `${remaining} seconds to lock a move` : "Locking a guard"}
      </p>
      <div className="combat-stage-moves">
        {encounter.moves.map((move, index) => (
          <button key={move.command} type="button" onClick={() => onSend(move.command)}>
            {index < 9 ? `${index + 1}. ` : ""}
            {move.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
