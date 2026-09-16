import { useEffect, useState } from "react";
import type { CharacterVisual } from "@greenwood/contracts";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { npcArtSrc } from "./npc-plates.js";
import { objectArtSrc } from "./object-plates.js";

export type PresencePerson = {
  id: string;
  name: string;
  kind: "npc" | "player" | "object";
  visual?: CharacterVisual;
};

function kindLabel(kind: PresencePerson["kind"]): string {
  if (kind === "npc") return "NPC";
  if (kind === "player") return "Collegian";
  return "object";
}

export function plateSrc(person: PresencePerson): string | undefined {
  return person.kind === "object" ? objectArtSrc(person.id, person.name) : npcArtSrc(person.id);
}

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
  const openPerson = people.find((person) => person.id === openId);
  return (
    <div className="presence-layer">
      {openPerson ? <PresenceZoom person={openPerson} /> : null}
      <div className="presence-rail" aria-label="People and objects in this room">
        {people.map((person) => {
          const open = openId === person.id;
          const plate = plateSrc(person);
          return (
            <div key={person.id} className={`presence-slot${open ? " open" : ""}`}>
              <button
                type="button"
                className={`presence-avatar ${person.kind}`}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={`${person.name}, ${kindLabel(person.kind)}`}
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
    </div>
  );
}

export function PresenceZoom({ person }: { person: PresencePerson }) {
  const plate = plateSrc(person);
  return (
    <aside className="presence-zoom" aria-label={`Full artwork of ${person.name}`}>
      {plate ? (
        <img src={plate} alt="" draggable={false} />
      ) : person.visual ? (
        <CharacterPortrait visual={person.visual} name={person.name} decorative />
      ) : (
        <span className="presence-initial" aria-hidden="true">
          {person.name.slice(0, 1)}
        </span>
      )}
    </aside>
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
      {person.kind === "object" ? null : (
        <>
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
        </>
      )}
    </div>
  );
}
