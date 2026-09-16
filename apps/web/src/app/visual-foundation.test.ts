import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, snapAppearanceValue, type PlayState } from "@greenwood/contracts";
import { AppearanceEditor } from "./AppearanceEditor.js";
import { CharacterPortrait } from "./CharacterPortrait.js";
import { Minimap, WorldMapDialog } from "./Minimap.js";
import { PlayPanels } from "./PlayPanels.js";
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
  },
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
    expect(html).toContain("Court (you)");
    expect(html).toContain("Hall");
    expect(html).toContain("Unexplored");
    expect(html).not.toContain(">Fog Room<");
    expect(renderToStaticMarkup(createElement(Minimap, {}))).toContain("No charted rooms here yet");
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
  it("renders server vitals, one story region, separate speech and immediate movement controls", () => {
    const html = renderToStaticMarkup(
      createElement(PlayPanels, {
        state,
        lines: [{ id: "room", kind: "narration", text: "Complete plain text room description." }],
        onCommand: () => {},
        onMove: () => {},
        worldMapOpen: false,
        onOpenWorldMap: () => {},
        onCloseWorldMap: () => {},
        connection: "connected",
        error: "",
      }),
    );
    expect(html).toContain('max="20" value="8"');
    expect(html).toContain("In combat");
    expect(html).toContain("Complete plain text room description.");
    expect(html).toContain('aria-label="Around you and story"');
    expect(html).toContain('aria-label="Room speech"');
    expect(html).toContain("Move north");
    expect(html).not.toContain("Room description");
    expect(html).toContain("Compass movement");
    expect(html).toContain("World map");
    expect(html).toContain("/art/rooms/court.png");
    expect(html).toContain("Moss");
    expect(
      shouldFocusCommandInput({
        closest: (selectors) => (selectors.includes("[tabindex]") ? {} : null),
      }),
    ).toBe(false);
  });
  it("leaves narration available during reconnects and malformed visual responses", () => {
    const html = renderToStaticMarkup(
      createElement(PlayPanels, {
        lines: [{ id: "prior", kind: "narration", text: "A saved line." }],
        onCommand: () => {},
        onMove: () => {},
        worldMapOpen: false,
        onOpenWorldMap: () => {},
        onCloseWorldMap: () => {},
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
    expect(editor).toContain("Courtyard");
    expect(editor).not.toContain("Muzzle");
    expect(editor).toContain('aria-valuetext="chestnut"');
  });
});
