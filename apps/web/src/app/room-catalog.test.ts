import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RoomCatalog } from "./RoomCatalog.js";
import { COLLEGIUM_ROOM_PLATES } from "./room-plates.js";

describe("room catalog", () => {
  it("shows every Collegium plate with its painted file", () => {
    const html = renderToStaticMarkup(createElement(RoomCatalog));
    expect(html).toContain("Room catalog");
    expect(html).toContain("Sixty-six finished paintings");
    expect(COLLEGIUM_ROOM_PLATES).toHaveLength(66);
    expect(html).toContain("Wool Shed");
    expect(html).toContain("/art/rooms/wool-shed.png");
    expect(html).toContain("Lantern Court");
    expect(html).toContain("River Landing");
    expect(html).toContain("Wren&#x27;s Croft");
    expect(html).toContain("Fog Hollow");
    expect(html).toContain("/art/rooms/lantern-court.png");
    expect(html).toContain("/art/rooms/clock-tower.png");
    expect(html).toContain("/art/rooms/quiet-chapel.png");
    expect(html).toContain('alt="Lantern Court"');
    for (const room of COLLEGIUM_ROOM_PLATES) {
      expect(html).toContain(`/art/rooms/${room.id}.png`);
      expect(html).toContain(room.title.replaceAll("'", "&#x27;"));
    }
  });
});
