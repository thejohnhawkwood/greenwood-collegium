/** Pixel size of a chart name. Matches `.map-room-label` (7rem wide, a few lines). */
export const MAP_LABEL_WIDTH = 112;
export const MAP_LABEL_GAP = 8;
/** One map unit, in pixels, leaves a gap between neighbouring names. */
export const MAP_READABLE_SCALE = MAP_LABEL_WIDTH + MAP_LABEL_GAP;

export type MapLabelInput = {
  id: string;
  x: number;
  y: number;
  /** Lower draws first and keeps the spot. Current is 0, a quest is 1, a name is 2. */
  priority: number;
  width: number;
  height: number;
};

export function mapLabelMetrics(room: {
  state: "unknown" | "explored" | "current";
  quest?: boolean;
}): { width: number; height: number; priority: number } | null {
  if (room.state === "unknown") {
    if (!room.quest) return null;
    return { width: 72, height: 28, priority: 1 };
  }
  let lines = 1;
  if (room.state === "current") lines += 1;
  if (room.quest) lines += 1;
  return {
    width: MAP_LABEL_WIDTH,
    height: 16 + lines * 20,
    priority: room.state === "current" ? 0 : room.quest ? 1 : 2,
  };
}

export function mapFitScale(
  unitWidth: number,
  unitHeight: number,
  viewW: number,
  viewH: number,
): number {
  const pad = 16;
  return Math.min(
    Math.max(viewW - pad, 1) / Math.max(unitWidth, 0.1),
    Math.max(viewH - pad, 1) / Math.max(unitHeight, 0.1),
  );
}

/** Open close enough to read names. A small floor stays fitted when that is already readable. */
export function mapOpeningScale(fitScale: number): number {
  if (!Number.isFinite(fitScale) || fitScale <= 0) return MAP_READABLE_SCALE;
  if (fitScale >= MAP_READABLE_SCALE) return Math.min(fitScale, MAP_READABLE_SCALE * 1.75);
  return MAP_READABLE_SCALE;
}

export function mapZoomBounds(fitScale: number): { min: number; max: number } {
  const fit = Number.isFinite(fitScale) && fitScale > 0 ? fitScale : MAP_READABLE_SCALE;
  return {
    min: Math.max(16, Math.min(fit, MAP_READABLE_SCALE)),
    max: Math.max(MAP_READABLE_SCALE * 2.5, fit),
  };
}

export function clampMapScale(scale: number, fitScale: number): number {
  const { min, max } = mapZoomBounds(fitScale);
  return Math.min(max, Math.max(min, scale));
}

/** Names that fit at this scale. A covered name is left off so labels do not stack. */
export function visibleMapLabelIds(rooms: readonly MapLabelInput[], scale: number): Set<string> {
  const sorted = [...rooms].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
  const placed: { left: number; top: number; right: number; bottom: number }[] = [];
  const visible = new Set<string>();
  for (const room of sorted) {
    const cx = room.x * scale;
    const cy = room.y * scale;
    const box = {
      left: cx - room.width / 2,
      top: cy - room.height / 2,
      right: cx + room.width / 2,
      bottom: cy + room.height / 2,
    };
    const crowded = placed.some(
      (other) =>
        box.left < other.right + MAP_LABEL_GAP &&
        box.right + MAP_LABEL_GAP > other.left &&
        box.top < other.bottom + MAP_LABEL_GAP &&
        box.bottom + MAP_LABEL_GAP > other.top,
    );
    if (!crowded) {
      placed.push(box);
      visible.add(room.id);
    }
  }
  return visible;
}

export function clampMapPan(pan: number, view: number, stage: number): number {
  if (stage <= view) return (view - stage) / 2;
  return Math.min(0, Math.max(view - stage, pan));
}

export function mapPanToPoint(args: {
  focusX: number;
  focusY: number;
  originX: number;
  originY: number;
  scale: number;
  viewW: number;
  viewH: number;
  unitWidth: number;
  unitHeight: number;
}): { x: number; y: number } {
  return {
    x: clampMapPan(
      args.viewW / 2 - (args.focusX - args.originX) * args.scale,
      args.viewW,
      args.unitWidth * args.scale,
    ),
    y: clampMapPan(
      args.viewH / 2 - (args.focusY - args.originY) * args.scale,
      args.viewH,
      args.unitHeight * args.scale,
    ),
  };
}

/** Zoom toward a point in the viewport, keeping that chart point under the cursor. */
export function mapZoomAt(args: {
  scale: number;
  nextScale: number;
  panX: number;
  panY: number;
  cursorX: number;
  cursorY: number;
  viewW: number;
  viewH: number;
  unitWidth: number;
  unitHeight: number;
}): { scale: number; x: number; y: number } {
  const stageX = args.cursorX - args.panX;
  const stageY = args.cursorY - args.panY;
  const ratio = args.scale === 0 ? 1 : args.nextScale / args.scale;
  return {
    scale: args.nextScale,
    x: clampMapPan(args.cursorX - stageX * ratio, args.viewW, args.unitWidth * args.nextScale),
    y: clampMapPan(args.cursorY - stageY * ratio, args.viewH, args.unitHeight * args.nextScale),
  };
}
