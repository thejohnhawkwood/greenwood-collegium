import { describe, expect, it } from "vitest";
import {
  MAP_READABLE_SCALE,
  clampMapPan,
  mapFitScale,
  mapLabelMetrics,
  mapOpeningScale,
  mapPanToPoint,
  mapZoomAt,
  visibleMapLabelIds,
} from "./map-zoom.js";

function named(
  id: string,
  x: number,
  y: number,
  state: "explored" | "current" = "explored",
  quest = false,
) {
  const metrics = mapLabelMetrics({ state, quest });
  if (!metrics) throw new Error(id);
  return { id, x, y, ...metrics };
}

describe("map zoom", () => {
  it("opens a crowded floor close enough to read, and fits a small floor", () => {
    expect(mapOpeningScale(60)).toBe(MAP_READABLE_SCALE);
    expect(mapOpeningScale(400)).toBe(MAP_READABLE_SCALE * 1.75);
    expect(mapOpeningScale(140)).toBe(140);
    expect(mapFitScale(10, 5, 200, 100)).toBeCloseTo(Math.min(184 / 10, 84 / 5));
  });

  it("shows every neighbour at a readable scale and tucks covered names when zoomed out", () => {
    const rooms = [
      named("court", 0, 0, "current"),
      named("hall", 1, 0),
      named("orchard", 0, 1),
      named("hearth", 1, 1, "explored", true),
    ];
    const readable = visibleMapLabelIds(rooms, MAP_READABLE_SCALE);
    expect([...readable].sort()).toEqual(["court", "hall", "hearth", "orchard"]);
    const far = visibleMapLabelIds(rooms, 40);
    expect(far.has("court")).toBe(true);
    expect(far.size).toBeLessThan(rooms.length);
    expect(far.has("hall")).toBe(false);
  });

  it("keeps a quest name ahead of an ordinary neighbour", () => {
    const rooms = [named("shed", 0, 0), named("veil", 1, 0, "explored", true)];
    const shown = visibleMapLabelIds(rooms, 40);
    expect(shown.has("veil")).toBe(true);
    expect(shown.has("shed")).toBe(false);
  });

  it("centers a point and zooms toward the cursor", () => {
    expect(clampMapPan(10, 200, 100)).toBe(50);
    expect(clampMapPan(10, 100, 300)).toBe(0);
    expect(clampMapPan(-250, 100, 300)).toBe(-200);
    const pan = mapPanToPoint({
      focusX: 4,
      focusY: 0,
      originX: 0,
      originY: 0,
      scale: 100,
      viewW: 200,
      viewH: 200,
      unitWidth: 5,
      unitHeight: 3,
    });
    expect(pan).toEqual({ x: -300, y: 0 });
    const zoomed = mapZoomAt({
      scale: 100,
      nextScale: 200,
      panX: 0,
      panY: 0,
      cursorX: 50,
      cursorY: 40,
      viewW: 400,
      viewH: 300,
      unitWidth: 4,
      unitHeight: 3,
    });
    expect(zoomed.scale).toBe(200);
    expect(zoomed.x).toBe(-50);
    expect(zoomed.y).toBe(-40);
  });
});
