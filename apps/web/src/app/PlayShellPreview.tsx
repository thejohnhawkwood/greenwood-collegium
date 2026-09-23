import { DEFAULT_APPEARANCE, schemaVersion, type PlayState } from "@greenwood/contracts";
import { useState } from "react";
import { AcademyFrame } from "./academy-frame.js";
import { CollegiumLobby } from "./CollegiumLobby.js";
import { PlayChrome } from "./PlayChrome.js";
import { PlayPanels } from "./PlayPanels.js";
import { previewEquipmentSlots } from "./preview-equipment.js";

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
    {
      id: "item-sword",
      name: "Practice Sword",
      equipped: true,
      category: "weapon",
      description: "The blade is wood, nicked from many lessons.",
      slot: "main-hand",
    },
    {
      id: "item-key",
      name: "Small Copper Key",
      equipped: false,
      description: "A small copper key.",
    },
  ],
  slots: previewEquipmentSlots,
  quests: [
    {
      id: "arrival",
      title: "Arrival at the Collegium",
      status: "active",
      reward: "10 experience",
      current: "Say hello so Porter knows you arrived.",
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

const primerPreviewState: PlayState = {
  ...previewState,
  character: { ...previewState.character, inCombat: false, level: 4, experience: 45 },
  encounter: undefined,
  primer: {
    ink: 1,
    prompt: "The Primer holds 1 ink. Choose a vein.",
    leaves: [
      {
        schoolId: "ember",
        title: "Ember",
        mentor: "Mentor Cinder",
        outline: "lanceolate",
        open: true,
        nodes: [
          {
            id: "ember",
            name: "Ember",
            distance: 0,
            parents: [],
            status: "inked",
            legal: true,
            rank: 1,
            numbers: "Focus 4. Damage 5. Burns 2.",
            description: "A small coal of will that lands and lingers.",
            ranks: [
              {
                rank: 1,
                mark: "I",
                numbers: "Focus 4. Damage 5. Burns 2.",
                held: true,
                spend: false,
              },
              {
                rank: 2,
                mark: "II",
                numbers: "Focus 4. Damage 6. Burns 2.",
                held: false,
                spend: true,
              },
              {
                rank: 3,
                mark: "III",
                numbers: "Focus 3. Damage 6. Burns 2.",
                held: false,
                spend: false,
              },
              {
                rank: 4,
                mark: "IV",
                numbers: "Focus 3. Damage 7. Burns 2.",
                held: false,
                spend: false,
              },
              {
                rank: 5,
                mark: "V",
                numbers: "Focus 3. Damage 8. Burns 2.",
                held: false,
                spend: false,
              },
            ],
          },
          {
            id: "cinder-snap",
            name: "Cinder Snap",
            distance: 1,
            parents: ["ember"],
            status: "ready",
            legal: true,
            numbers: "Focus 3. Damage 3.",
            description: "A sharp spark. The foe cannot answer.",
            ranks: [
              { rank: 1, mark: "I", numbers: "Focus 3. Damage 3.", held: false, spend: true },
              { rank: 2, mark: "II", numbers: "Focus 3. Damage 4.", held: false, spend: false },
              { rank: 3, mark: "III", numbers: "Focus 2. Damage 4.", held: false, spend: false },
              { rank: 4, mark: "IV", numbers: "Focus 2. Damage 5.", held: false, spend: false },
              { rank: 5, mark: "V", numbers: "Focus 2. Damage 6.", held: false, spend: false },
            ],
          },
          {
            id: "blaze-mantle",
            name: "Blaze-Mantle",
            distance: 3,
            parents: ["hearth-ward", "flame-breath"],
            join: "and",
            status: "locked",
            legal: false,
            description: "The next blow misses, and the attacker takes the burn.",
            ranks: [
              { rank: 1, mark: "I", held: false, spend: false },
              { rank: 2, mark: "II", held: false, spend: false },
              { rank: 3, mark: "III", held: false, spend: false },
              { rank: 4, mark: "IV", held: false, spend: false },
              { rank: 5, mark: "V", held: false, spend: false },
            ],
          },
        ],
      },
      {
        schoolId: "thorn",
        title: "Thorns",
        mentor: "Mentor Briar",
        outline: "compound",
        open: false,
        nodes: [],
      },
    ],
  },
};

export function PlayShellPreview() {
  const wantsPrimer = new URLSearchParams(window.location.search).has("primer");
  const state = wantsPrimer ? primerPreviewState : previewState;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(true);
  const [worldMapOpen, setWorldMapOpen] = useState(false);
  const [questJournalOpen, setQuestJournalOpen] = useState(false);
  const [lastSend, setLastSend] = useState("");
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
          state={state}
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
          onSend={(command) => setLastSend(command)}
          error={lastSend ? `Preview sent: ${lastSend}` : ""}
          onMove={() => {}}
          worldMapOpen={worldMapOpen}
          onOpenWorldMap={() => setWorldMapOpen(true)}
          primerRequest={wantsPrimer ? 1 : 0}
          onCloseWorldMap={() => setWorldMapOpen(false)}
          questJournalOpen={questJournalOpen}
          onOpenQuestJournal={() => setQuestJournalOpen(true)}
          onCloseQuestJournal={() => setQuestJournalOpen(false)}
          connection="connected"
        />
        <CollegiumLobby
          open={lobbyOpen}
          state={state}
          onEnter={() => setLobbyOpen(false)}
          onTravel={() => setLobbyOpen(false)}
        />
      </main>
    </AcademyFrame>
  );
}
