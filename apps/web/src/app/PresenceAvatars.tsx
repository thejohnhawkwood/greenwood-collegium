import { useEffect, useState } from "react";
import type { CharacterVisual } from "@greenwood/contracts";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { npcArtSrc } from "./npc-plates.js";

export type PresencePerson = {
  id: string;
  name: string;
  kind: "npc" | "player";
  visual?: CharacterVisual;
};

export function PresenceAvatars({
  people,
  onSend,
}: {
  people: readonly PresencePerson[];
  onSend: (command: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    if (!openId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);
  if (!people.length) return null;
  return (
    <div className="presence-rail" aria-label="People in this room">
      {people.map((person) => {
        const open = openId === person.id;
        const plate = npcArtSrc(person.id);
        return (
          <div key={person.id} className={`presence-slot${open ? " open" : ""}`}>
            <button
              type="button"
              className={`presence-avatar ${person.kind}`}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-label={`${person.name}, ${person.kind === "npc" ? "NPC" : "Collegian"}`}
              title={person.name}
              onClick={() => setOpenId(open ? null : person.id)}
            >
              {plate ? (
                <img className="presence-plate" src={plate} alt="" draggable={false} />
              ) : person.visual ? (
                <CharacterPortrait
                  visual={person.visual}
                  name={person.name}
                  decorative
                  crop="avatar"
                />
              ) : (
                <span className="presence-initial" aria-hidden="true">
                  {person.name.slice(0, 1)}
                </span>
              )}
            </button>
            {open ? (
              <PresenceMenu person={person} onSend={onSend} onClose={() => setOpenId(null)} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function PresenceMenu({
  person,
  onSend,
  onClose,
}: {
  person: PresencePerson;
  onSend: (command: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="presence-menu" role="menu" aria-label={`${person.name} actions`}>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSend(`examine ${person.name}`);
          onClose();
        }}
      >
        Examine
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSend(person.kind === "npc" ? `talk ${person.name}` : `say hello`);
          onClose();
        }}
      >
        Talk
      </button>
      <button type="button" role="menuitem" disabled title="Duels come later">
        Ask to duel
      </button>
    </div>
  );
}
