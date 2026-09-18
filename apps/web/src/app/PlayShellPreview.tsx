import { DEFAULT_APPEARANCE, schemaVersion, type PlayState } from "@greenwood/contracts";
import { useState } from "react";
import { AcademyFrame } from "./academy-frame.js";
import { CollegiumLobby } from "./CollegiumLobby.js";
import { PlayChrome } from "./PlayChrome.js";
import { PlayPanels } from "./PlayPanels.js";

const previewState: PlayState = {
  character: {
    id: "self",
    name: "Archimedes the Owl",
    visual: { speciesId: "owl", gender: "male", appearance: { ...DEFAULT_APPEARANCE } },
    health: 20,
    maxHealth: 20,
    focus: 10,
    maxFocus: 10,
    level: 2,
    experience: 20,
    inCombat: true,
    equipped: "Practice Sword",
    gifts: [],
  },
  encounter: {
    id: "enc-preview",
    round: 1,
    status: "awaiting_intents",
    lockDeadlineAt: new Date(Date.now() + 12_000).toISOString(),
    enemy: {
      id: "enemy-practice-dummy-south-orchard",
      name: "Practice Dummy",
      health: 3,
      maxHealth: 8,
      focus: 6,
      maxFocus: 6,
    },
    moves: [
      { label: "Attack", command: "attack", kind: "attack" },
      { label: "Ember", command: "cast ember", kind: "cast" },
      { label: "Defend", command: "defend", kind: "defend" },
      { label: "Flee", command: "flee", kind: "flee" },
    ],
  },
  bag: [
    { id: "item-sword", name: "Practice Sword", equipped: true, category: "weapon" },
    { id: "item-key", name: "Small Copper Key", equipped: false },
  ],
  quests: [
    {
      id: "arrival",
      title: "Arrival at the Collegium",
      status: "active",
      steps: [
        {
          id: "look",
          label: "Look around Lantern Court",
          done: true,
          hint: "Type look to see Lantern Court.",
        },
        { id: "speak", label: "Say hello so Porter knows you arrived.", done: false },
      ],
    },
  ],
  peers: [
    {
      id: "peer",
      name: "Moss",
      visual: { speciesId: "mole", appearance: DEFAULT_APPEARANCE },
      roomTitle: "Porter Lodge",
    },
  ],
  minimap: {
    rooms: [
      { id: "porter-lodge", title: "Porter Lodge", x: 0, y: 0, state: "current" },
      { id: "lantern-court", title: "Lantern Court", x: 0, y: -1, state: "explored" },
      { id: "fog", x: 1, y: 0, state: "unknown" },
    ],
    paths: [
      { from: "porter-lodge", to: "lantern-court" },
      { from: "porter-lodge", to: "fog" },
    ],
  },
  room: {
    roomId: "porter-lodge",
    title: "Porter Lodge",
    shortDescription: "A ticking kettle keeps company with labelled keys.",
    longDescription: "A ticking kettle keeps company with labelled keys.",
    zone: "lodgings",
    visualState: "porter-lodge",
    exits: [
      { direction: "west", toRoomId: "lantern-court" },
      { direction: "east", toRoomId: "fog" },
    ],
    visible: [
      { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
      { id: "npc-headmaster-alder", name: "Headmaster Alder", kind: "npc" },
      { id: "object-key-board", name: "Key Board", kind: "object" },
      { id: "item-practice-sword-south-orchard", name: "Practice Sword", kind: "object" },
      { id: "enemy-practice-dummy-south-orchard", name: "Practice Dummy", kind: "npc" },
      {
        id: "peer",
        name: "Moss",
        kind: "player",
        visual: { speciesId: "mole", appearance: DEFAULT_APPEARANCE },
      },
    ],
  },
};

export function PlayShellPreview() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(true);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [questJournalOpen, setQuestJournalOpen] = useState(false);
  return (
    <AcademyFrame playing>
      <main className="client play-client">
        <PlayChrome
          connection="connected"
          accountLabel="Signed in as preview."
          signedIn
          settingsOpen={settingsOpen}
          onOpenSettings={() => setSettingsOpen(true)}
          onCloseSettings={() => setSettingsOpen(false)}
          onOpenLobby={() => setLobbyOpen(true)}
          onShowGate={() => {}}
          onSignOut={() => {}}
          authNotice={null}
        />
        <PlayPanels
          state={previewState}
          lines={[
            { id: "look", kind: "narration", text: "Healer Fen waits nearby." },
            {
              id: "ember",
              kind: "narration",
              text: "You cast Ember at the Practice Dummy for 5. It has 3 remaining.",
              event: {
                eventId: "evt-preview-ember",
                sequence: 1,
                schemaVersion,
                type: "combat.action_resolved",
                occurredAt: "2026-09-18T16:00:00.000Z",
                audience: "character",
                encounterId: "enc-preview",
                presentationKey: "ember-burst",
                narration: "You cast Ember at the Practice Dummy for 5. It has 3 remaining.",
                payload: {
                  encounterId: "enc-preview",
                  actorId: "self",
                  actorName: "Archimedes the Owl",
                  actorKind: "player",
                  verb: "cast",
                  spellId: "ember",
                  spellName: "Ember",
                  focusSpent: 4,
                  targetId: "enemy-practice-dummy-south-orchard",
                  targetName: "Practice Dummy",
                  damage: 5,
                  targetHealth: 3,
                  targetMaxHealth: 8,
                },
              },
            },
          ]}
          onCommand={() => {}}
          onSend={() => {}}
          onMove={() => {}}
          worldMapOpen={worldMapOpen}
          onOpenWorldMap={() => setWorldMapOpen(true)}
          onCloseWorldMap={() => setWorldMapOpen(false)}
          questJournalOpen={questJournalOpen}
          onOpenQuestJournal={() => setQuestJournalOpen(true)}
          onCloseQuestJournal={() => setQuestJournalOpen(false)}
          connection="connected"
          error=""
        />
        <CollegiumLobby
          open={lobbyOpen}
          state={previewState}
          onEnter={() => setLobbyOpen(false)}
          onTravel={() => setLobbyOpen(false)}
        />
      </main>
    </AcademyFrame>
  );
}
