import { DEFAULT_APPEARANCE, type PlayState } from "@greenwood/contracts";
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
    inCombat: false,
    equipped: "Practice Sword",
  },
  conversation: {
    npcId: "npc-porter-bramble",
    npcName: "Porter Bramble",
    prompt: "Why a weapon, I wonder?",
    choices: [
      { say: "1", label: "Why does a weapon fit a first-year?" },
      { say: "2", label: "I will put it back." },
    ],
  },
  bag: [
    { id: "item-sword", name: "Practice Sword", equipped: true, category: "weapon" },
    { id: "item-key", name: "Small Copper Key", equipped: false },
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
              id: "travel",
              kind: "narration",
              text: "[SYSTEM] You follow the known paths to Lantern Court.",
            },
          ]}
          onCommand={() => {}}
          onSend={() => {}}
          onMove={() => {}}
          worldMapOpen={worldMapOpen}
          onOpenWorldMap={() => setWorldMapOpen(true)}
          onCloseWorldMap={() => setWorldMapOpen(false)}
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
