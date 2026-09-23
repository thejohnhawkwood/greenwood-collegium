import { DEFAULT_APPEARANCE, schemaVersion, type PlayState } from "@greenwood/contracts";
import { useState } from "react";
import { AcademyFrame } from "./academy-frame.js";
import { CollegiumLobby } from "./CollegiumLobby.js";
import { PlayChrome } from "./PlayChrome.js";
import { CommandStatus } from "./CommandStatus.js";
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
    read: "Practice Dummy leans in. A guard meets the swing and loads your next blow.",
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
      { id: "lantern-court", title: "Lantern Court", x: 0, y: -1, state: "explored", quest: true },
      { id: "fog", x: 1, y: 0, state: "unknown", quest: true },
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

const duelChallenge = {
  npcId: "duel-challenge",
  npcName: "Moss",
  prompt: "Moss asks for a classroom duel. Both of you must agree.",
  choices: [
    { say: "1", label: "Accept the duel" },
    { say: "2", label: "Decline" },
  ],
};

/** Grounds-sized chart for `/?shell=1&map=1`. Names sit on the real spacing. */
function crowdChart(): PlayState["minimap"] {
  const placed: Array<[string, string, number, number, PlayState["minimap"]["rooms"][number]["state"]]> =
    [
      ["observatory", "Observatory", 0, 3, "explored"],
      ["kitchens", "Kitchens", 2, 3, "explored"],
      ["archive-cellar", "Archive Cellar", -2, 2, "explored"],
      ["music-loft", "Music Loft", -1, 2, "explored"],
      ["north-quad", "North Quad", 0, 2, "explored"],
      ["clock-tower", "Clock Tower", 1, 2, "explored"],
      ["refectory", "Refectory", 2, 2, "explored"],
      ["hearth-stars", "Hearth of Stars", 5, 2, "explored"],
      ["wren-croft", "Wren's Croft", 6, 2, "explored"],
      ["peat-cut", "Peat Cut", 8, 2, "explored"],
      ["scriptorium", "Scriptorium", -3, 1, "explored"],
      ["library-stacks", "Library Stacks", -2, 1, "explored"],
      ["great-hall", "Great Hall", 0, 1, "explored"],
      ["porter-lodge", "Porter Lodge", 1, 1, "current"],
      ["lecture-theatre", "Lecture Theatre", 2, 1, "explored"],
      ["infirmary", "Infirmary", 3, 1, "explored"],
      ["hearth-thorn", "Hearth of Thorn", 5, 1, "explored"],
      ["moor-track", "Moor Track", 6, 1, "explored"],
      ["sheepfold", "Sheepfold", 7, 1, "explored"],
      ["standing-stones", "Standing Stones", 8, 1, "explored"],
      ["greenhouse", "Greenhouse", -2, 0, "explored"],
      ["west-cloister", "West Cloister", -1, 0, "explored"],
      ["lantern-court", "Lantern Court", 0, 0, "explored"],
      ["east-gate", "East Gate", 1, 0, "explored"],
      ["east-meadow", "East Meadow", 3, 0, "explored"],
      ["hall-of-schools", "Hall of Schools", 4, 0, "explored"],
      ["hearth-ember", "Hearth of Ember", 5, 0, "explored"],
      ["quiet-chapel", "Quiet Chapel", -3, -1, "explored"],
      ["herb-garden", "Herb Garden", -2, -1, "explored"],
      ["south-orchard", "South Orchard", 0, -1, "explored"],
      ["pottery-shed", "Pottery Shed", 2, -1, "explored"],
      ["hearth-stone", "Hearth of Stone", 4, -1, "explored"],
      ["hearth-veil", "Hearth of the Veil", 5, -1, "explored"],
      ["river-landing", "River Landing", 0, -2, "explored"],
      ["otter-slip", "Otter Slip", 0, -3, "explored"],
      ["skiff-line", "Skiff Line", 1, -3, "explored"],
      ["barrow-mouth", "Barrow Mouth", 8, 3, "unknown"],
      ["fog-east", "Fog", 9, 2, "unknown"],
    ];
  const rooms = placed.map(([id, title, x, y, state]) =>
    state === "unknown"
      ? { id, x, y, state, quest: id === "barrow-mouth" }
      : { id, title, x, y, state, quest: id === "lantern-court" },
  );
  const paths = rooms.flatMap((from, index) =>
    rooms.slice(index + 1).flatMap((to) =>
      Math.abs(from.x - to.x) + Math.abs(from.y - to.y) === 1 ? [{ from: from.id, to: to.id }] : [],
    ),
  );
  return { rooms, paths };
}

export function PlayShellPreview() {
  const params = new URLSearchParams(window.location.search);
  const wantsPrimer = params.has("primer");
  const wantsBoard = params.has("board");
  const wantsMap = params.has("map");
  const duel = params.get("duel");
  const peaceful = {
    ...primerPreviewState,
    primer: undefined,
    character: { ...primerPreviewState.character, inCombat: false },
  };
  const boardState = {
    ...peaceful,
    room: {
      ...peaceful.room,
      visible: [
        ...peaceful.room.visible,
        { id: "object-noticeboard", name: "Noticeboard", kind: "object" as const },
      ],
    },
    noticeboard: {
      posts: [
        {
          questId: "the-missing-pages",
          title: "The Missing Pages",
          status: "offered" as const,
          line: "Examine the Ink Blotter. Then talk quill.",
          place: "Library Stacks",
          who: "Librarian Quill",
          command: "seek Librarian Quill",
        },
        {
          questId: "arrival-at-the-collegium",
          title: "Arrival at the Collegium",
          status: "active" as const,
          line: "Say hello so Porter knows you arrived.",
          place: "Lantern Court",
          who: "Porter Bramble",
        },
      ],
    },
  };
  const state = wantsMap
    ? { ...peaceful, minimap: crowdChart() }
    : wantsBoard
    ? boardState
    : duel === "1"
      ? { ...peaceful, conversation: duelChallenge }
      : duel === "wait"
        ? { ...peaceful, conversation: undefined, duelAsk: { name: "Moss" } }
        : wantsPrimer
          ? primerPreviewState
          : previewState;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lobbyOpen, setLobbyOpen] = useState(!duel && !wantsBoard && !wantsMap);
  const [worldMapOpen, setWorldMapOpen] = useState(wantsMap);
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
        <div className="command-dock">
          <CommandStatus state={state} />
          <form
            className="command-form"
            onSubmit={(event) => {
              event.preventDefault();
              const field = event.currentTarget.elements.namedItem("command");
              const command = field instanceof HTMLInputElement ? field.value.trim() : "";
              if (command) setLastSend(command);
            }}
          >
            <label className="command-label">
              <span className="prompt" aria-hidden="true">
                ❯
              </span>
              <input name="command" placeholder="Type a command… Tab completes a word" />
            </label>
            <button type="submit">Send</button>
          </form>
        </div>
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
