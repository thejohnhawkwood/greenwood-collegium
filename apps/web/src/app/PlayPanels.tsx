import type { PlayState } from "@greenwood/contracts";
import { useState } from "react";
import { BagPanel } from "./BagPanel.js";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { isDialogueMenuText } from "./conversation-from-story.js";
import { GameTranscript } from "./GameTranscript.js";
import { Minimap, WorldMapDialog } from "./Minimap.js";
import { PresenceAvatars } from "./PresenceAvatars.js";
import { QuestJournal } from "./QuestJournal.js";
import { RoomScene } from "./RoomScene.js";
import type { TranscriptLine } from "./transcript.js";

const directionLetters: Record<string, string> = {
  north: "N",
  south: "S",
  east: "E",
  west: "W",
  up: "U",
  down: "D",
};

export function PlayPanels({
  state,
  lines,
  onCommand,
  onSend,
  onMove,
  worldMapOpen,
  onOpenWorldMap,
  onCloseWorldMap,
  questJournalOpen,
  onOpenQuestJournal,
  onCloseQuestJournal,
  connection,
  error,
  followToken,
}: {
  state?: PlayState;
  lines: readonly TranscriptLine[];
  onCommand: (command: string) => void;
  onSend: (command: string) => void;
  onMove: (direction: string) => void;
  worldMapOpen: boolean;
  onOpenWorldMap: () => void;
  onCloseWorldMap: () => void;
  questJournalOpen: boolean;
  onOpenQuestJournal: () => void;
  onCloseQuestJournal: () => void;
  connection: string;
  error: string;
  followToken?: number;
}) {
  const [bagOpen, setBagOpen] = useState(false);
  const room = state?.room;
  const character = state?.character;
  const story = lines.filter((line) => !isDialogueMenuText(line.text));
  const conversation = state?.conversation;
  return (
    <div className="play-scroll">
      {error ? (
        <p className="view-notice" role="alert">
          {error}
        </p>
      ) : null}
      <div className="play-grid">
        <aside className="character-aside" aria-label="Your character and local map">
          <section className="play-panel paper-doll" aria-labelledby="collegian-heading">
            <div className="panel-heading">
              <h2 id="collegian-heading">Your Collegian</h2>
              <span aria-hidden="true">✧</span>
            </div>
            <div className="portrait-mat">
              <CharacterPortrait
                visual={character?.visual}
                name={character?.name ?? "Waiting for your Collegian"}
              />
              {character ? (
                <div className="portrait-vitals" aria-label="Character status">
                  <Vital
                    label="Health"
                    value={character.health}
                    max={character.maxHealth}
                    tone="health"
                  />
                  <Vital
                    label="Focus"
                    value={character.focus}
                    max={character.maxFocus}
                    tone="focus"
                  />
                  <span className={`combat-state${character.inCombat ? " in-combat" : ""}`}>
                    {character.inCombat ? "In combat" : "Exploring"}
                  </span>
                </div>
              ) : null}
            </div>
            <h3>{character?.name ?? "Joining the realm…"}</h3>
            <p className="small-copy">
              {character
                ? `Level ${character.level} · ${character.experience} XP`
                : "Your character will appear here."}
            </p>
            <dl className="equipment-caption">
              <dt>In hand</dt>
              <dd>
                {character ? (character.equipped ?? "Nothing equipped") : "Waiting for the realm"}
              </dd>
            </dl>
            {state?.bag.length ? (
              <ul className="bag-strip" aria-label="Bag">
                {state.bag.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setBagOpen(true);
                        onSend(`examine ${item.name}`);
                      }}
                    >
                      {item.name}
                      {item.equipped ? " · in hand" : ""}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="small-copy">Bag empty. Inventory opens the full list.</p>
            )}
            <div className="character-actions">
              <button
                type="button"
                onClick={() => {
                  setBagOpen(true);
                  onSend("inventory");
                }}
              >
                Inventory
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenQuestJournal();
                  onSend("quests");
                }}
              >
                Quests
              </button>
            </div>
          </section>
          <section className="play-panel local-map" aria-labelledby="local-map-heading">
            <div className="panel-heading">
              <h2 id="local-map-heading">Minimap</h2>
              <button type="button" onClick={onOpenWorldMap}>
                World map
              </button>
            </div>
            <Minimap state={state} />
            <nav className="exit-buttons" aria-label="Compass movement">
              {room?.exits.map((exit) => (
                <button
                  key={exit.direction}
                  type="button"
                  title={`Move ${exit.direction}`}
                  aria-label={`Move ${exit.direction}`}
                  disabled={connection !== "connected"}
                  data-direction={exit.direction}
                  onClick={() => onMove(exit.direction)}
                >
                  {directionLetters[exit.direction] ?? exit.direction.slice(0, 1).toUpperCase()}
                </button>
              ))}
            </nav>
            {room && !room.exits.length ? <p className="small-copy">No visible exits.</p> : null}
          </section>
        </aside>
        <div className="room-column">
          <section className="play-panel room-view" aria-labelledby="room-title">
            <div className="room-stage">
              <RoomScene visualState={room?.visualState ?? room?.roomId} />
              <header className="room-title">
                <span className="eyebrow">
                  {room?.zone.replaceAll("-", " ") ?? "The Greenwood Collegium"}
                </span>
                <h2 id="room-title">
                  {room?.title ??
                    (connection === "connected"
                      ? "Opening the gates…"
                      : "Reconnecting to the realm…")}
                </h2>
                <p>
                  {room?.shortDescription ??
                    "Your transcript stays here while the connection returns."}
                </p>
              </header>
              <PresenceAvatars
                people={(room?.visible ?? []).map((entity) => ({
                  id: entity.id,
                  name: entity.name,
                  kind:
                    entity.kind === "npc" ? "npc" : entity.kind === "player" ? "player" : "object",
                  visual: entity.visual,
                }))}
                conversation={conversation}
                inCombat={character?.inCombat}
                gift={character?.gift}
                onSend={onSend}
              />
            </div>
          </section>
          <div className="reading-panes">
            <section className="play-panel story-panel" aria-labelledby="story-heading">
              <div className="panel-heading">
                <h2 id="story-heading">Around you & story</h2>
                <button type="button" onClick={() => onSend("look")}>
                  Look ↗
                </button>
                <button type="button" onClick={() => onSend("help")}>
                  Help ↗
                </button>
                <button type="button" onClick={() => onCommand("say ")}>
                  Say ↗
                </button>
              </div>
              <GameTranscript
                lines={story}
                label="Around you and story"
                followToken={followToken}
              />
            </section>
          </div>
        </div>
      </div>
      <WorldMapDialog
        open={worldMapOpen}
        state={state}
        onClose={onCloseWorldMap}
        onPrepareMove={(direction) => onMove(direction)}
        onTravel={(title) => onSend(`travel ${title}`)}
      />
      <BagPanel open={bagOpen} state={state} onClose={() => setBagOpen(false)} onSend={onSend} />
      <QuestJournal open={questJournalOpen} state={state} onClose={onCloseQuestJournal} />
    </div>
  );
}

function Vital({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: string;
}) {
  return (
    <div className={`vital vital-${tone}`}>
      <span>
        {label}
        <strong>
          {value} / {max}
        </strong>
      </span>
      <meter min={0} max={max} value={value} aria-label={label}>
        {value} / {max}
      </meter>
    </div>
  );
}
