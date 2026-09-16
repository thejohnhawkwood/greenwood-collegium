import { DEFAULT_APPEARANCE, type PlayState } from "@greenwood/contracts";
import { useState } from "react";
import { AcademyFrame } from "./academy-frame.js";
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
  },
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
          onShowGate={() => {}}
          onSignOut={() => {}}
          authNotice={null}
        />
        <PlayPanels
          state={previewState}
          lines={[{ id: "look", kind: "narration", text: "Healer Fen waits nearby." }]}
          onCommand={() => {}}
          onSend={() => {}}
          onMove={() => {}}
          worldMapOpen={false}
          onOpenWorldMap={() => {}}
          onCloseWorldMap={() => {}}
          connection="connected"
          error=""
        />
      </main>
    </AcademyFrame>
  );
}
