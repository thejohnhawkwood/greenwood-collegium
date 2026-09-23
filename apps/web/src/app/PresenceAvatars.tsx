import type { PlayState } from "@greenwood/contracts";
import { useCallback, useEffect, useState } from "react";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { ConversationStage } from "./ConversationStage.js";
import { isHostile, presenceActions, type PresencePerson } from "./presence-actions.js";
import {
  forcedPresenceId,
  handOverlap,
  isConversationVisible,
  plateSrc,
  tokenKind,
} from "./presence-layout.js";

export type { PresencePerson };

function kindLabel(kind: PresencePerson["kind"], person: PresencePerson): string {
  if (isHostile(person)) return "enemy";
  if (kind === "npc") return "NPC";
  if (kind === "player") return "Collegian";
  return "object";
}

export function PresenceAvatars({
  people,
  conversation,
  inCombat,
  gift,
  gifts,
  onSend,
  onOpenNoticeboard,
}: {
  people: readonly PresencePerson[];
  conversation?: PlayState["conversation"];
  inCombat?: boolean;
  gift?: PlayState["character"]["gift"];
  gifts?: PlayState["character"]["gifts"];
  onSend: (command: string) => void;
  onOpenNoticeboard?: () => void;
}) {
  const forcedId = forcedPresenceId(people, conversation, inCombat);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [dismissedNpcId, setDismissedNpcId] = useState<string | null>(null);
  const visibleConversation = isConversationVisible(conversation, dismissedNpcId)
    ? conversation
    : undefined;
  const openId = forcedId ?? pickedId ?? (visibleConversation ? visibleConversation.npcId : null);
  const dismissConversation = useCallback(() => {
    if (!visibleConversation) {
      return;
    }
    setDismissedNpcId(visibleConversation.npcId);
    setPickedId(null);
    onSend("bye");
  }, [visibleConversation, onSend]);
  useEffect(() => {
    if (!openId || forcedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (visibleConversation) {
          dismissConversation();
          return;
        }
        setPickedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, forcedId, visibleConversation, dismissConversation]);
  const openPerson = people.find((person) => person.id === openId);
  if (!people.length && !visibleConversation) return null;
  const overlap = handOverlap(people.length);
  return (
    <div className="presence-layer">
      {openPerson ? (
        <div
          className="presence-focus"
          data-forced={forcedId ? "true" : undefined}
          aria-live="polite"
        >
          {!forcedId ? (
            <button
              type="button"
              className="presence-close"
              aria-label={visibleConversation ? "Close conversation" : "Close portrait"}
              onClick={() => {
                if (visibleConversation) {
                  dismissConversation();
                  return;
                }
                setPickedId(null);
              }}
            >
              ×
            </button>
          ) : null}
          <PresenceZoom person={openPerson} />
          <PresenceMenu
            person={openPerson}
            gift={gift}
            gifts={gifts}
            onSend={(command) => {
              if (command.startsWith("talk ")) {
                setDismissedNpcId(null);
              }
              onSend(command);
            }}
            onOpenNoticeboard={onOpenNoticeboard}
            onClose={() => {
              if (!forcedId) setPickedId(null);
            }}
          />
        </div>
      ) : null}
      {visibleConversation ? (
        <ConversationStage
          conversation={visibleConversation}
          onSend={onSend}
          onClose={dismissConversation}
        />
      ) : null}
      {people.length ? (
        <div
          className="presence-rail"
          aria-label="People and objects in this room"
          data-count={people.length}
          style={{ ["--hand-overlap" as string]: `${String(overlap)}px` }}
        >
          {people.map((person, index) => {
            const open = openId === person.id;
            const plate = plateSrc(person);
            return (
              <div
                key={person.id}
                className={`presence-slot${open ? " open" : ""}`}
                style={{ zIndex: open ? people.length + 2 : index + 1 }}
              >
                <button
                  type="button"
                  className={`presence-avatar ${tokenKind(person)}`}
                  aria-expanded={open}
                  aria-haspopup="dialog"
                  aria-label={`${person.name}, ${kindLabel(person.kind, person)}`}
                  title={person.name}
                  onClick={() => {
                    if (forcedId === person.id) {
                      return;
                    }
                    setPickedId(open && !forcedId ? null : person.id);
                  }}
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
              </div>
            );
          })}
        </div>
      ) : null}
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
  gift,
  gifts,
  onSend,
  onOpenNoticeboard,
  onClose,
}: {
  person: PresencePerson;
  gift?: { id: string; name: string };
  gifts?: readonly { id: string; name: string }[];
  onSend: (command: string) => void;
  onOpenNoticeboard?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="presence-menu" role="menu" aria-label={`${person.name} actions`}>
      {presenceActions(person, gift, gifts).map((action) => (
        <button
          key={action.label}
          type="button"
          role="menuitem"
          disabled={action.disabled}
          title={action.title}
          onClick={() => {
            if (action.openBoard) {
              onOpenNoticeboard?.();
              onClose();
              return;
            }
            if (!action.command) return;
            onSend(action.command);
            if (!action.command.startsWith("talk ")) {
              onClose();
            }
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
