import type { CharacterVisual, EventEnvelope, PlayState } from "@greenwood/contracts";
import { useEffect, useState } from "react";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { resolveCombatFx } from "./combat-fx.js";
import { secondsLeft } from "./combat-stage.js";
import { npcArtSrc } from "./npc-plates.js";

export function CombatStage({
  encounter,
  foeVisual,
  fxEvent,
  equipped,
  pulse = true,
  history,
  player,
  selfOverlay,
  selfShake = false,
  onSend,
}: {
  encounter: NonNullable<PlayState["encounter"]>;
  foeVisual?: CharacterVisual;
  fxEvent?: EventEnvelope;
  equipped?: string;
  pulse?: boolean;
  history?: string;
  player?: {
    name: string;
    visual?: CharacterVisual;
    health: number;
    maxHealth: number;
    focus: number;
    maxFocus: number;
  };
  selfOverlay?: string;
  selfShake?: boolean;
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
  const fx = resolveCombatFx({
    event: fxEvent,
    equipped,
    health: foe.health,
    maxHealth: foe.maxHealth,
  });
  const showPulse = pulse && fx.motion !== "self";
  const shaking = showPulse && fx.shakeTarget === "foe";
  const selfPose = pulse ? fx.poses.self : undefined;
  const foePose = pulse ? fx.poses.foe : undefined;
  return (
    <aside
      className="combat-stage"
      role="dialog"
      aria-modal="true"
      aria-label={`Fighting ${foe.name}`}
    >
      <p className="combat-stage-round">Round {encounter.round}</p>
      {encounter.read ? <p className="combat-stage-read">{encounter.read}</p> : null}
      <div className="combat-pair">
        {player ? (
          <section
            className={`combat-self${selfPose ? ` is-${selfPose}` : ""}`}
            aria-label={player.name}
          >
            <CharacterPortrait
              visual={player.visual}
              name={player.name}
              overlaySrc={selfOverlay}
              shake={selfShake}
            />
            <p className="combat-stage-foe">{player.name}</p>
            <div className="combat-stage-meters">
              <CombatVital
                label="Health"
                value={player.health}
                max={player.maxHealth}
                tone="health"
              />
              <CombatVital label="Focus" value={player.focus} max={player.maxFocus} tone="focus" />
            </div>
          </section>
        ) : null}
        <section className={`combat-foe${foePose ? ` is-${foePose}` : ""}`} aria-label={foe.name}>
          {plate || foeVisual ? (
            <figure
              className={`combat-stage-art${shaking ? " is-shaking" : ""}${fx.defeat ? " is-defeated" : ""}`}
            >
              <div className="combat-stage-plate">
                {plate ? (
                  <img src={plate} alt="" />
                ) : (
                  <CharacterPortrait visual={foeVisual} name={foe.name} decorative crop="avatar" />
                )}
              </div>
              {fx.wound ? (
                <img
                  className="combat-fx combat-fx-wound"
                  src={fx.wound}
                  alt=""
                  draggable={false}
                />
              ) : null}
              {showPulse && fx.weapon ? (
                <img
                  className={`combat-fx combat-fx-weapon combat-fx-${fx.motion ?? "swing"}`}
                  src={fx.weapon}
                  alt=""
                  draggable={false}
                />
              ) : null}
              {showPulse && fx.spell ? (
                <img
                  className={`combat-fx combat-fx-spell combat-fx-${fx.motion ?? "pulse"}`}
                  src={fx.spell}
                  alt=""
                  draggable={false}
                />
              ) : null}
              {showPulse && fx.impact && fx.shakeTarget === "foe" ? (
                <img
                  className="combat-fx combat-fx-impact"
                  src={fx.impact}
                  alt=""
                  draggable={false}
                />
              ) : null}
              {fx.defeat ? (
                <img
                  className="combat-fx combat-fx-defeat"
                  src={fx.defeat}
                  alt=""
                  draggable={false}
                />
              ) : null}
            </figure>
          ) : null}
          <p className="combat-stage-foe">{foe.name}</p>
          <div className="combat-stage-meters">
            <CombatVital label="Health" value={foe.health} max={foe.maxHealth} tone="health" />
            <CombatVital label="Focus" value={foe.focus} max={foe.maxFocus} tone="focus" />
          </div>
        </section>
      </div>
      {history ? <p className="combat-history">{history}</p> : null}
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
