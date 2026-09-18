import type { CharacterVisual, PlayState } from "@greenwood/contracts";
import { useEffect, useState } from "react";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { secondsLeft } from "./combat-stage.js";
import { npcArtSrc } from "./npc-plates.js";

export function CombatStage({
  encounter,
  foeVisual,
  onSend,
}: {
  encounter: NonNullable<PlayState["encounter"]>;
  foeVisual?: CharacterVisual;
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
  const plate = npcArtSrc(foe.id);
  return (
    <aside className="combat-stage" aria-label={`Fighting ${foe.name}`}>
      <p className="combat-stage-round">Round {encounter.round}</p>
      {plate || foeVisual ? (
        <figure className="combat-stage-art">
          {plate ? (
            <img src={plate} alt="" />
          ) : (
            <CharacterPortrait visual={foeVisual} name={foe.name} decorative crop="avatar" />
          )}
        </figure>
      ) : null}
      <p className="combat-stage-foe">{foe.name}</p>
      <div className="combat-stage-meters">
        <CombatVital label="Health" value={foe.health} max={foe.maxHealth} tone="health" />
        <CombatVital label="Focus" value={foe.focus} max={foe.maxFocus} tone="focus" />
      </div>
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

function CombatVital({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "health" | "focus";
}) {
  return (
    <div className={`vital vital-${tone}`}>
      <span>
        {label} {value} / {max}
      </span>
      <meter min={0} max={max} value={value} aria-label={`${label} ${value} / ${max}`}>
        {value} / {max}
      </meter>
    </div>
  );
}
