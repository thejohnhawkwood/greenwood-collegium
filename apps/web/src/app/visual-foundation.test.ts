import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, snapAppearanceValue, type PlayState } from "@greenwood/contracts";
import { AppearanceEditor } from "./AppearanceEditor.js";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { Minimap, WorldMapDialog } from "./Minimap.js";
import { CollegiumLobby } from "./CollegiumLobby.js";
import { PlayChrome } from "./PlayChrome.js";
import { BagPanel } from "./BagPanel.js";
import { PlayPanels } from "./PlayPanels.js";
import { QuestJournal } from "./QuestJournal.js";
import {
  forcedPresenceId,
  handOverlap,
  isConversationVisible,
  PresenceAvatars,
  PresenceMenu,
  PresenceZoom,
  tokenKind,
} from "./PresenceAvatars.js";
import { presenceActions } from "./presence-actions.js";
import { npcArtSrc } from "./npc-plates.js";
import { objectArtSrc } from "./object-plates.js";
import { portraitLayers, roomArtSrc } from "./portrait-layers.js";
import { shouldFocusCommandInput } from "./command-focus.js";

const state: PlayState = {
  character: {
    id: "self",
    name: "Fern",
    visual: { speciesId: "fox", appearance: { ...DEFAULT_APPEARANCE, accessory: "scarf" } },
    health: 8,
    maxHealth: 20,
    focus: 4,
    maxFocus: 10,
    level: 2,
    experience: 125,
    inCombat: true,
    equipped: "Practice Sword",
    gifts: [],
  },
  conversation: {
    npcId: "npc-porter-bramble",
    npcName: "Porter Bramble",
    prompt: "Why a weapon, I wonder?",
    choices: [{ say: "1", label: "Why does a weapon fit?" }],
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
  peers: [],
  minimap: {
    rooms: [
      { id: "court", title: "Court", x: 0, y: 0, state: "current" },
      { id: "fog", x: 1, y: 0, state: "unknown" },
    ],
    paths: [{ from: "court", to: "fog" }],
  },
  room: {
    roomId: "court",
    title: "Court",
    shortDescription: "Lanterns overhead.",
    longDescription: "Complete plain text room description.",
    zone: "academy",
    exits: [{ direction: "north", toRoomId: "hall" }],
    visible: [
      {
        id: "peer",
        name: "Moss",
        kind: "player",
        visual: { speciesId: "mole", appearance: DEFAULT_APPEARANCE },
      },
      {
        id: "npc-porter-bramble",
        name: "Porter Bramble",
        kind: "npc",
      },
      {
        id: "object-key-board",
        name: "Key Board",
        kind: "object",
      },
    ],
  },
};
describe("visual foundation", () => {
  it("draws authored north above the current room and provides a text map", () => {
    const html = renderToStaticMarkup(
      createElement(Minimap, {
        state: {
          ...state,
          minimap: {
            rooms: [
              ...state.minimap.rooms,
              { id: "hall", title: "Hall", x: 0, y: 1, state: "explored" },
            ],
            paths: [
              { from: "court", to: "hall" },
              { from: "court", to: "fog" },
            ],
          },
        },
      }),
    );
    expect(html).toContain('y2="-1"');
    expect(html).toContain("Unexplored");
    expect(html).not.toContain("North ↑");
    expect(html).not.toContain("Court (you)");
    expect(html).not.toContain(">Fog Room<");
    const world = renderToStaticMarkup(
      createElement(Minimap, {
        size: "world",
        state: {
          ...state,
          minimap: {
            rooms: [
              ...state.minimap.rooms,
              { id: "hall", title: "Hall", x: 0, y: 1, state: "explored" },
            ],
            paths: [
              { from: "court", to: "hall" },
              { from: "court", to: "fog" },
            ],
          },
        },
      }),
    );
    expect(world).toContain("Court (you)");
    expect(world).toContain("Hall");
    expect(world).toContain("Travel to Hall");
    expect(world).toContain("North ↑");
    expect(world).toContain("Grounds");
    expect(renderToStaticMarkup(createElement(Minimap, {}))).toContain(
      "No charted rooms on this level yet",
    );
    const stacked = renderToStaticMarkup(
      createElement(Minimap, {
        state: {
          ...state,
          minimap: {
            rooms: [
              { id: "court", title: "Court", x: 0, y: 0, z: 0, state: "current" },
              { id: "study", title: "The High Study", x: 0, y: 1, z: 1, state: "explored" },
              { id: "cradle", title: "Deep Cradle", x: 2, y: 0, z: -2, state: "explored" },
            ],
            paths: [],
          },
        },
      }),
    );
    expect(stacked).toContain("Grounds");
    expect(stacked).not.toContain("The High Study");
    expect(stacked).not.toContain("Deep Cradle");
    const worldDialog = renderToStaticMarkup(
      createElement(WorldMapDialog, {
        open: true,
        state: {
          ...state,
          room: {
            ...state.room,
            exits: [
              { direction: "up", toRoomId: "study" },
              { direction: "down", toRoomId: "stair" },
            ],
          },
          minimap: {
            rooms: [
              { id: "court", title: "Court", x: 0, y: 0, z: 0, state: "current" },
              { id: "hall", title: "Great Hall", x: 0, y: 1, z: 0, state: "explored" },
              { id: "study", title: "The High Study", x: 0, y: 1, z: 1, state: "explored" },
              { id: "cradle", title: "Deep Cradle", x: 2, y: 0, z: -2, state: "explored" },
            ],
            paths: [],
          },
        },
        onClose: () => {},
        onPrepareMove: () => {},
        onTravel: () => {},
      }),
    );
    expect(worldDialog).toContain("Up");
    expect(worldDialog).toContain("Down");
    expect(worldDialog).toContain("Climb up");
    expect(worldDialog).toContain("Go down");
    expect(worldDialog).toContain("Grounds");
    expect(worldDialog).toContain("Travel to Great Hall");
    expect(worldDialog).toContain('aria-label="Travel to Great Hall"');
  });
  it("renders every supported species with the same deterministic layers at every size", () => {
    const portraits = new Set<string>();
    for (const speciesId of [
      "mouse",
      "hare",
      "badger",
      "otter",
      "squirrel",
      "mole",
      "hedgehog",
      "fox",
      "stoat",
      "owl",
      "toad",
    ]) {
      const props = {
        name: "Fern",
        visual: { speciesId, appearance: state.character.visual.appearance },
      };
      const html = renderToStaticMarkup(createElement(CharacterPortrait, props));
      expect(html).toBe(renderToStaticMarkup(createElement(CharacterPortrait, props)));
      expect(html).not.toContain("/art/characters/accessories/scarf.png");
      expect(html).not.toContain("/art/characters/clothing/");
      expect(html).toContain('data-layer="weapon"');
      expect(html).toContain(`/art/characters/looks/${speciesId}-female-fern.png`);
      portraits.add(html.replace(/aria-label="[^"]*"/, ""));
    }
    expect(portraits.size).toBe(11);
  });
  it("provides readable fallback portraits and text for missing species", () => {
    expect(renderToStaticMarkup(createElement(CharacterPortrait, { name: "Legacy" }))).toContain(
      "portrait unavailable",
    );
    expect(
      renderToStaticMarkup(
        createElement(CharacterPortrait, {
          name: "Legacy",
          visual: { speciesId: "missing", appearance: DEFAULT_APPEARANCE },
        }),
      ),
    ).toContain("Legacy: missing");
  });
  it("renders server vitals, one story region, and immediate movement controls", () => {
    const html = renderToStaticMarkup(
      createElement(PlayPanels, {
        state,
        lines: [{ id: "room", kind: "narration", text: "Complete plain text room description." }],
        onCommand: () => {},
        onSend: () => {},
        onMove: () => {},
        worldMapOpen: false,
        onOpenWorldMap: () => {},
        onCloseWorldMap: () => {},
        questJournalOpen: false,
        onOpenQuestJournal: () => {},
        onCloseQuestJournal: () => {},
        connection: "connected",
        error: "",
      }),
    );
    expect(html).toContain('max="20" value="8"');
    expect(html).toContain("portrait-vitals");
    expect(html).toContain("In combat");
    expect(html).toContain("Level 2 · 125 XP");
    expect(html).toContain("Complete plain text room description.");
    expect(html).toContain('aria-label="Around you and story"');
    expect(html).not.toContain('aria-label="Room speech"');
    expect(html).toContain("Say ↗");
    expect(html).toContain('aria-label="Move north"');
    expect(html).toContain(">N<");
    expect(html).not.toContain("Room description");
    expect(html).not.toContain("In this room");
    expect(html).toContain("Compass movement");
    expect(html).toContain("World map");
    expect(html).toContain("/art/rooms/court.png");
    expect(html).toContain("Moss");
    expect(html).toContain("Porter Bramble");
    expect(html).toContain("People and objects in this room");
    expect(html).toContain("Key Board, object");
    expect(html).toContain("/art/objects/object-key-board.png");
    expect(html).toContain("Talking with Porter Bramble");
    expect(html).toContain("Why does a weapon fit?");
    expect(html).toContain("Why a weapon, I wonder?");
    expect(html).toContain('aria-label="Bag"');
    expect(html).toContain("Small Copper Key");
    expect(
      renderToStaticMarkup(
        createElement(BagPanel, {
          open: true,
          state,
          onClose: () => {},
          onSend: () => {},
        }),
      ),
    ).toMatch(/Bag and equipment[\s\S]*Practice Sword[\s\S]*Small Copper Key[\s\S]*Equip/);
    expect(
      renderToStaticMarkup(
        createElement(QuestJournal, {
          open: true,
          state,
          onClose: () => {},
        }),
      ),
    ).toMatch(
      /Current quests[\s\S]*Arrival at the Collegium[\s\S]*Look around Lantern Court[\s\S]*Type look to see Lantern Court[\s\S]*Say hello so Porter knows you arrived/,
    );
    expect(
      shouldFocusCommandInput({
        closest: (selectors) => (selectors.includes("[tabindex]") ? {} : null),
      }),
    ).toBe(false);
  });
  it("renders Primer pick buttons from play-state without inventing card text", () => {
    const html = renderToStaticMarkup(
      createElement(PlayPanels, {
        state: {
          ...state,
          character: { ...state.character, inCombat: false },
          conversation: undefined,
          primer: {
            pennedBy: "Mentor Cinder",
            prompt: "Mentor Cinder's hand offers three leaves.",
            cards: [
              {
                command: "1",
                title: "Ember",
                badge: "Rank II",
                kind: "upgrade",
                numbers: "Focus 4. Damage 6. Burns 2.",
                description: "A small coal of will that lands and lingers.",
                pennedBy: "Cinder Wick",
              },
              {
                command: "2",
                title: "Flame-Breath",
                badge: "New",
                kind: "unlock",
                numbers: "Focus 5. Damage 4. Burns 1.",
                description: "A gust of open flame. It scorches and leaves one burn.",
              },
              {
                command: "3",
                title: "Vital leaf",
                badge: "Vital",
                kind: "vital",
                numbers: "+2 health. +1 focus.",
                description:
                  "A thicker page. Your health and focus rise so the next field is kinder.",
              },
            ],
          },
        },
        lines: [
          { id: "primer", kind: "narration", text: "Mentor Cinder's hand offers three leaves." },
        ],
        onCommand: () => {},
        onSend: () => {},
        onMove: () => {},
        worldMapOpen: false,
        onOpenWorldMap: () => {},
        onCloseWorldMap: () => {},
        questJournalOpen: false,
        onOpenQuestJournal: () => {},
        onCloseQuestJournal: () => {},
        connection: "connected",
        error: "",
      }),
    );
    expect(html).toContain('aria-label="Field Primer choices"');
    expect(html).toContain("A small coal of will that lands and lingers.");
    expect(html).toContain("A gust of open flame. It scorches and leaves one burn.");
    expect(html).toContain(
      "A thicker page. Your health and focus rise so the next field is kinder.",
    );
    expect(html).toContain(
      'aria-label="Choose 1: Ember. A small coal of will that lands and lingers."',
    );
    expect(html).not.toContain("Talking with Porter Bramble");
  });
  it("leaves narration available during reconnects and malformed visual responses", () => {
    const html = renderToStaticMarkup(
      createElement(PlayPanels, {
        lines: [{ id: "prior", kind: "narration", text: "A saved line." }],
        onCommand: () => {},
        onSend: () => {},
        onMove: () => {},
        worldMapOpen: false,
        onOpenWorldMap: () => {},
        onCloseWorldMap: () => {},
        questJournalOpen: false,
        onOpenQuestJournal: () => {},
        onCloseQuestJournal: () => {},
        connection: "disconnected",
        error: "Visual view unavailable.",
      }),
    );
    expect(html).toContain("A saved line.");
    expect(html).toContain('role="alert"');
    expect(html).toContain("Reconnecting to the realm");
    expect(html).not.toContain("<meter");
  });
  it("opens a world map with explored names and unnamed fog", () => {
    const html = renderToStaticMarkup(
      createElement(WorldMapDialog, {
        open: true,
        state,
        onClose: () => {},
        onPrepareMove: () => {},
      }),
    );
    expect(html).toContain("World map");
    expect(html).toContain("Court (you)");
    expect(html).toContain("remain unnamed in fog");
    expect(html).toContain("Unexplored");
    expect(html).not.toContain("Fogged Library");
  });
  it("snaps workshop sliders and lists painted layer files", () => {
    const fox = {
      speciesId: "fox",
      appearance: { ...DEFAULT_APPEARANCE, accessory: "scarf", marking: "blaze" },
    };
    const layers = portraitLayers(fox);
    expect(layers.find((layer) => layer.layer === "body")?.src).toBe(
      "/art/characters/looks/fox-female-fern.png",
    );
    expect(layers.find((layer) => layer.layer === "clothing")).toBeUndefined();
    expect(layers.find((layer) => layer.layer === "marking")).toBeUndefined();
    expect(layers.some((layer) => layer.layer === "weapon" && !layer.src)).toBe(true);
    expect(roomArtSrc("lantern-court")).toBe("/art/rooms/lantern-court.png");
    expect(snapAppearanceValue("ears", 2)).toBe("long");
    const editor = renderToStaticMarkup(
      createElement(AppearanceEditor, { value: DEFAULT_APPEARANCE, onChange: () => {} }),
    );
    expect(editor).toContain('type="range"');
    expect(editor).toContain("Silhouette");
    expect(editor).toContain("Colouring");
    expect(editor).toContain("look-catalog");
    expect(editor).toContain("Courtyard");
    expect(editor).not.toContain("Muzzle");
    expect(editor).toContain('aria-valuetext="chestnut"');
  });
  it("keeps academy chrome on the right and opens settings", () => {
    const html = renderToStaticMarkup(
      createElement(PlayChrome, {
        connection: "connected",
        accountLabel: "Signed in as fern.",
        signedIn: true,
        settingsOpen: true,
        onOpenSettings: () => {},
        onCloseSettings: () => {},
        onShowGate: () => {},
        onSignOut: () => {},
        authNotice: null,
      }),
    );
    expect(html).toContain("Settings");
    expect(html).toContain("Signed in as fern.");
    expect(html).toContain('aria-label="Settings"');
    expect(html).toContain("Sign out");
  });
  it("offers the commands that work on each room token", () => {
    const html = renderToStaticMarkup(
      createElement(PresenceAvatars, {
        people: [
          { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
          {
            id: "peer",
            name: "Moss",
            kind: "player",
            visual: { speciesId: "mole", appearance: DEFAULT_APPEARANCE },
          },
        ],
        onSend: () => {},
      }),
    );
    expect(html).toContain("Porter Bramble, NPC");
    expect(html).toContain("presence-avatar npc");
    expect(html).toContain("presence-avatar player");
    expect(html).toContain("/art/characters/npcs/npc-porter-bramble.png");
    expect(npcArtSrc("enemy-practice-dummy-south-orchard")).toBe(
      "/art/characters/npcs/practice-dummy.png?v=east-watch-1",
    );
    expect(npcArtSrc("npc-piper-mole")).toBe(
      "/art/characters/npcs/npc-piper-mole.png?v=east-watch-1",
    );
    expect(npcArtSrc("enemy-silk-hatchling-cocoon-nave")).toBe(
      "/art/characters/npcs/silk-hatchling.png?v=east-watch-1",
    );
    expect(npcArtSrc("npc-shepherd-wren")).toBe(
      "/art/characters/npcs/npc-shepherd-wren.png?v=east-watch-1",
    );
    expect(npcArtSrc("enemy-mist-crow-sheepfold")).toBe(
      "/art/characters/npcs/mist-crow.png?v=east-watch-1",
    );
    expect(npcArtSrc("enemy-fog-walker-fog-hollow")).toBe(
      "/art/characters/npcs/fog-walker.png?v=east-watch-1",
    );
    expect(objectArtSrc("object-holm-wrapping", "Keeper's Wrapping")).toBe(
      "/art/objects/object-holm-wrapping.png",
    );
    expect(objectArtSrc("object-waystone", "Waystone")).toBe("/art/objects/object-waystone.png");
    expect(objectArtSrc("object-silk-thread", "Silk Thread")).toBe(
      "/art/objects/object-silk-thread.png",
    );
    expect(objectArtSrc("item-copper-key-lantern-court", "Small Copper Key")).toBe(
      "/art/objects/small-copper-key.png",
    );
    expect(objectArtSrc("object-courtyard-well", "Courtyard Well")).toBe(
      "/art/objects/object-courtyard-well.png",
    );
    expect(objectArtSrc("object-orchard-apples", "Fallen Apples")).toBe(
      "/art/objects/object-seedling-tray.png",
    );
    expect(html).toContain("Moss, Collegian");
    const menu = renderToStaticMarkup(
      createElement(PresenceMenu, {
        person: { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
        onSend: () => {},
        onClose: () => {},
      }),
    );
    expect(menu).toContain("Examine");
    expect(menu).toContain("Talk");
    expect(menu).not.toContain("Take");
    expect(menu).not.toContain("Attack");
    expect(menu).not.toContain("Ask to duel");
    const playerMenu = renderToStaticMarkup(
      createElement(PresenceMenu, {
        person: { id: "char-moss", name: "Moss the Mole", kind: "player" },
        onSend: () => {},
        onClose: () => {},
      }),
    );
    expect(playerMenu).toContain("Ask to duel");
    const objectMenu = renderToStaticMarkup(
      createElement(PresenceMenu, {
        person: { id: "object-key-board", name: "Key Board", kind: "object" },
        onSend: () => {},
        onClose: () => {},
      }),
    );
    expect(objectMenu).toContain("Examine");
    expect(objectMenu).not.toContain("Drink");
    expect(objectMenu).not.toContain("Talk");
    expect(objectMenu).not.toContain("Take");
    expect(objectMenu).not.toContain("Attack");
    expect(
      presenceActions({
        id: "object-courtyard-well",
        name: "Courtyard Well",
        kind: "object",
      }).map((action) => action.label),
    ).toEqual(["Examine", "Drink"]);
    expect(
      presenceActions({
        id: "object-orchard-apples",
        name: "Fallen Apples",
        kind: "object",
      }).map((action) => action.label),
    ).toEqual(["Examine", "Eat"]);
    const itemMenu = renderToStaticMarkup(
      createElement(PresenceMenu, {
        person: { id: "item-practice-sword-south-orchard", name: "Practice Sword", kind: "object" },
        onSend: () => {},
        onClose: () => {},
      }),
    );
    expect(itemMenu).toContain("Examine");
    expect(itemMenu).toContain("Take");
    expect(itemMenu).not.toContain("Attack");
    const lootId = "item-enemy-practice-dummy-south-orchard-loot-straw-practice-scrap";
    expect(objectArtSrc("librarians-ribbon", "Librarian's Ribbon")).toBe(
      "/art/objects/object-folded-page.png",
    );
    expect(objectArtSrc(lootId, "Straw Practice Scrap")).toBe(
      "/art/objects/straw-practice-scrap.png",
    );
    expect(
      presenceActions({
        id: lootId,
        name: "Straw Practice Scrap",
        kind: "object",
      }).map((action) => action.label),
    ).toEqual(["Examine", "Take"]);
    expect(
      tokenKind({
        id: lootId,
        name: "Straw Practice Scrap",
        kind: "object",
      }),
    ).toBe("object");
    const dummyMenu = renderToStaticMarkup(
      createElement(PresenceMenu, {
        person: {
          id: "enemy-practice-dummy-south-orchard",
          name: "Practice Dummy",
          kind: "npc",
        },
        onSend: () => {},
        onClose: () => {},
      }),
    );
    expect(dummyMenu).toContain("Examine");
    expect(dummyMenu).toContain("Attack");
    expect(dummyMenu).toContain("Cast Ember");
    expect(dummyMenu).not.toContain("Talk");
    expect(
      presenceActions({
        id: "item-practice-sword-south-orchard",
        name: "Practice Sword",
        kind: "object",
      }).map((action) => action.command),
    ).toEqual(["examine Practice Sword", "take Practice Sword"]);
    expect(
      presenceActions({
        id: "enemy-practice-dummy-south-orchard",
        name: "Practice Dummy",
        kind: "npc",
      }).map((action) => action.command),
    ).toEqual(["examine Practice Dummy", "attack Practice Dummy", "cast ember Practice Dummy"]);
    const zoom = renderToStaticMarkup(
      createElement(PresenceZoom, {
        person: { id: "npc-headmaster-alder", name: "Headmaster Alder", kind: "npc" },
      }),
    );
    expect(zoom).toContain("Full artwork of Headmaster Alder");
    expect(zoom).toContain("/art/characters/npcs/npc-headmaster-alder.png");
    expect(handOverlap(4)).toBe(0);
    expect(handOverlap(30)).toBe(-38);
    expect(tokenKind({ id: "peer", name: "Moss", kind: "player" })).toBe("player");
    expect(
      tokenKind({
        id: "enemy-practice-dummy-south-orchard",
        name: "Practice Dummy",
        kind: "npc",
      }),
    ).toBe("hostile");
    expect(
      forcedPresenceId([{ id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" }], {
        npcId: "npc-porter-bramble",
        npcName: "Porter Bramble",
        prompt: "Why a weapon, I wonder?",
        choices: [{ say: "1", label: "Why does a weapon fit?" }],
      }),
    ).toBeUndefined();
    expect(
      forcedPresenceId(
        [
          { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
          {
            id: "enemy-practice-dummy-south-orchard",
            name: "Practice Dummy",
            kind: "npc",
          },
        ],
        undefined,
        true,
      ),
    ).toBe("enemy-practice-dummy-south-orchard");
    const talking = renderToStaticMarkup(
      createElement(PresenceAvatars, {
        people: [
          { id: "npc-porter-bramble", name: "Porter Bramble", kind: "npc" },
          { id: "item-copper-key-lantern-court", name: "Small Copper Key", kind: "object" },
        ],
        conversation: {
          npcId: "npc-porter-bramble",
          npcName: "Porter Bramble",
          prompt: "Why a weapon, I wonder?",
          choices: [{ say: "1", label: "Why does a weapon fit?" }],
        },
        onSend: () => {},
      }),
    );
    expect(talking).toContain("Talking with Porter Bramble");
    expect(talking).toContain("Why a weapon, I wonder?");
    expect(talking).toContain("Why does a weapon fit?");
    expect(talking).toContain("Close conversation");
    expect(talking).toContain("×");
    expect(talking).toContain("Small Copper Key, object");
    expect(talking).not.toContain('data-forced="true"');
    const edge = {
      npcId: "npc-mentor-edge",
      npcName: "Mentor Edge",
      prompt: "Look the anvil. Then find the orchard.",
      choices: [] as { say: string; label: string }[],
    };
    expect(isConversationVisible(edge, null)).toBe(true);
    expect(isConversationVisible(edge, "npc-mentor-edge")).toBe(false);
    expect(
      isConversationVisible(
        { ...edge, prompt: "Steel teaches you to meet what comes." },
        "npc-mentor-edge",
      ),
    ).toBe(false);
    expect(isConversationVisible(edge, "npc-porter-bramble")).toBe(true);
  });
  it("lists known destinations and present Collegians in the lobby", () => {
    const html = renderToStaticMarkup(
      createElement(CollegiumLobby, {
        open: true,
        state: {
          ...state,
          peers: [
            {
              id: "peer",
              name: "Moss",
              visual: { speciesId: "mole", appearance: DEFAULT_APPEARANCE },
              roomTitle: "Court",
            },
          ],
          minimap: {
            rooms: [
              { id: "court", title: "Court", x: 0, y: 0, state: "current" },
              { id: "hall", title: "Hall", x: 0, y: 1, state: "explored" },
            ],
            paths: [{ from: "court", to: "hall" }],
          },
        },
        onEnter: () => {},
        onTravel: () => {},
      }),
    );
    expect(html).toContain("Collegium lobby");
    expect(html).toContain("Hall");
    expect(html).toContain("Moss");
    expect(html).toContain("Enter the Collegium");
  });
  it("renders a lock-in foe card with health, focus, and move buttons", () => {
    const fighting: PlayState = {
      ...state,
      conversation: undefined,
      encounter: {
        id: "enc-1",
        round: 1,
        status: "awaiting_intents",
        lockDeadlineAt: "2026-09-16T19:00:12.000Z",
        enemy: {
          id: "enemy-practice-dummy-south-orchard",
          name: "Practice Dummy",
          health: 8,
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
    };
    const html = renderToStaticMarkup(
      createElement(PlayPanels, {
        state: fighting,
        lines: [{ id: "room", kind: "narration", text: "You square up to the Practice Dummy." }],
        onCommand: () => {},
        onSend: () => {},
        onMove: () => {},
        worldMapOpen: false,
        onOpenWorldMap: () => {},
        onCloseWorldMap: () => {},
        questJournalOpen: false,
        onOpenQuestJournal: () => {},
        onCloseQuestJournal: () => {},
        connection: "connected",
        error: "",
      }),
    );
    expect(html).toContain("Fighting Practice Dummy");
    expect(html).toContain("/art/characters/npcs/practice-dummy.png?v=east-watch-1");
    expect(html).toContain("Health 8 / 8");
    expect(html).toContain("Focus 6 / 6");
    expect(html).toContain("1. Attack");
    expect(html).toContain("3. Defend");
    expect(html).toContain("4. Flee");
    expect(html).not.toContain("Talking with Porter Bramble");
  });
});
