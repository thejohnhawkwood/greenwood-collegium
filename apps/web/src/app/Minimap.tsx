import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { PlayState } from "@greenwood/contracts";
import { availableMapLevels, mapLevel, mapLevelLabel, nextMapLevel } from "./map-levels.js";
import { mapPlaceMessage } from "./map-place.js";
import {
  MAP_READABLE_SCALE,
  clampMapPan,
  clampMapScale,
  mapFitScale,
  mapLabelMetrics,
  mapOpeningScale,
  mapPanToPoint,
  mapZoomAt,
  visibleMapLabelIds,
} from "./map-zoom.js";

type MapSize = "compact" | "world";

export type MapTravelResult = { ok: boolean; message: string };

export function Minimap({
  state,
  size = "compact",
  level,
  onPrepareMove,
  onTravel,
  onPlaceMessage,
}: {
  state?: PlayState;
  size?: MapSize;
  level?: number;
  onPrepareMove?: (direction: string) => void;
  onTravel?: (title: string) => void;
  onPlaceMessage?: (message: string) => void;
}) {
  const patternId = useId();
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSize = useRef({ w: 0, h: 0 });
  const [chartPx, setChartPx] = useState({ w: 0, h: 0 });
  const dragRef = useRef<{
    id: number;
    x: number;
    y: number;
    panX: number;
    panY: number;
    moved: boolean;
  } | null>(null);
  const [view, setView] = useState<{ scale: number; x: number; y: number; level: number } | null>(
    null,
  );
  const currentLevel = mapLevel(
    state?.minimap.rooms.find((room) => room.state === "current") ?? {},
  );
  const shownLevel = level ?? currentLevel;
  const rooms = (state?.minimap.rooms ?? [])
    .filter((room) => mapLevel(room) === shownLevel)
    .map((room) => ({ ...room, y: -room.y }));
  const left = rooms.length ? Math.min(...rooms.map((room) => room.x)) : 0;
  const top = rooms.length ? Math.min(...rooms.map((room) => room.y)) : 0;
  const width = rooms.length ? Math.max(...rooms.map((room) => room.x)) - left + 1 : 1;
  const height = rooms.length ? Math.max(...rooms.map((room) => room.y)) - top + 1 : 1;
  const explored = rooms.filter((room) => room.state !== "unknown");
  const fog = rooms.length - explored.length;
  const label = `${mapLevelLabel(shownLevel)} map. You are in ${state?.room.title}. North is up. Explored rooms are marked; fog hides the rest.`;
  const boxWidth = width + 0.2;
  const boxHeight = height + 0.2;
  const originX = left - 0.6;
  const originY = top - 0.6;
  const focus = rooms.find((room) => room.state === "current");
  const focusX = focus?.x ?? originX + boxWidth / 2;
  const focusY = focus?.y ?? originY + boxHeight / 2;
  useLayoutEffect(() => {
    if (size !== "world" || rooms.length === 0) return;
    const el = viewportRef.current;
    if (!el) return;
    const place = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 8 || h < 8) return;
      viewportSize.current = { w, h };
      setChartPx((current) => (current.w === w && current.h === h ? current : { w, h }));
      setView((current) => {
        const fit = mapFitScale(boxWidth, boxHeight, w, h);
        if (current && current.level === shownLevel) {
          const scale = clampMapScale(current.scale, fit);
          const x = clampMapPan(current.x, w, boxWidth * scale);
          const y = clampMapPan(current.y, h, boxHeight * scale);
          if (scale === current.scale && x === current.x && y === current.y) return current;
          return { ...current, scale, x, y };
        }
        const scale = mapOpeningScale(fit);
        const pan = mapPanToPoint({
          focusX,
          focusY,
          originX,
          originY,
          scale,
          viewW: w,
          viewH: h,
          unitWidth: boxWidth,
          unitHeight: boxHeight,
        });
        return { scale, x: pan.x, y: pan.y, level: shownLevel };
      });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(el);
    return () => observer.disconnect();
  }, [size, shownLevel, rooms.length, boxWidth, boxHeight, originX, originY, focusX, focusY]);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || size !== "world" || rooms.length === 0) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      const w = el.clientWidth;
      const h = el.clientHeight;
      const fit = mapFitScale(boxWidth, boxHeight, w, h);
      setView((current) => {
        const scale = current?.scale ?? mapOpeningScale(fit);
        const zoomed = mapZoomAt({
          scale,
          nextScale: clampMapScale(scale * (event.deltaY < 0 ? 1.12 : 1 / 1.12), fit),
          panX: current?.x ?? 0,
          panY: current?.y ?? 0,
          cursorX: event.clientX - rect.left,
          cursorY: event.clientY - rect.top,
          viewW: w,
          viewH: h,
          unitWidth: boxWidth,
          unitHeight: boxHeight,
        });
        return { ...zoomed, level: shownLevel };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [size, shownLevel, rooms.length, boxWidth, boxHeight]);
  if (!rooms.length) return <p className="small-copy">No charted rooms on this level yet.</p>;
  const scale = view?.scale ?? MAP_READABLE_SCALE;
  const labelInputs = rooms.flatMap((room) => {
    const metrics = mapLabelMetrics(room);
    return metrics ? [{ id: room.id, x: room.x, y: room.y, ...metrics }] : [];
  });
  const visibleLabels = visibleMapLabelIds(labelInputs, scale);
  const tucked = labelInputs.length - visibleLabels.size;
  const chart = (
    <svg
      viewBox={`${String(originX)} ${String(originY)} ${String(boxWidth)} ${String(boxHeight)}`}
      role={size === "world" ? undefined : "img"}
      aria-label={size === "world" ? undefined : label}
    >
      <defs>
        <pattern
          id={patternId}
          width="0.12"
          height="0.12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <path d="M0 0H0.12" stroke="#6f7d68" strokeWidth="0.03" />
        </pattern>
      </defs>
      {state?.minimap.paths.map((path) => {
        const from = rooms.find((room) => room.id === path.from);
        const to = rooms.find((room) => room.id === path.to);
        return from && to ? (
          <line
            key={`${path.from}-${path.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="currentColor"
            strokeWidth="0.035"
          />
        ) : null;
      })}
      {rooms.map((room) => (
        <g key={room.id}>
          <title>
            {`${room.quest ? "Quest. " : ""}${
              room.state === "unknown"
                ? "Unexplored"
                : `${room.title ?? "Explored"}${room.state === "current" ? " — You are here" : ""}`
            }`}
          </title>
          <rect
            x={room.x - 0.13}
            y={room.y - 0.13}
            width="0.26"
            height="0.26"
            rx="0.04"
            pointerEvents="none"
            fill={
              room.state === "current"
                ? "#f2cf7c"
                : room.state === "explored"
                  ? "#79aaa1"
                  : `url(#${patternId})`
            }
            stroke={room.quest ? "#f2cf7c" : room.state === "unknown" ? "#6f7d68" : "none"}
            strokeWidth="0.02"
          />
          {room.state === "unknown" ? (
            <text
              x={room.x}
              y={room.y + 0.04}
              textAnchor="middle"
              fontSize="0.14"
              fill="#c5c7b0"
              pointerEvents="none"
            >
              ·
            </text>
          ) : null}
          {room.state === "current" ? (
            <circle
              cx={room.x}
              cy={room.y}
              r="0.21"
              fill="none"
              stroke="#f2cf7c"
              strokeWidth="0.025"
              pointerEvents="none"
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
  function chartSize() {
    const node = viewportRef.current;
    return {
      w: node?.clientWidth || viewportSize.current.w,
      h: node?.clientHeight || viewportSize.current.h,
    };
  }
  function zoomBy(factor: number) {
    const { w, h } = chartSize();
    if (w < 8 || h < 8) return;
    const fit = mapFitScale(boxWidth, boxHeight, w, h);
    setView((current) => {
      const currentScale = current?.scale ?? scale;
      const zoomed = mapZoomAt({
        scale: currentScale,
        nextScale: clampMapScale(currentScale * factor, fit),
        panX: current?.x ?? 0,
        panY: current?.y ?? 0,
        cursorX: w / 2,
        cursorY: h / 2,
        viewW: w,
        viewH: h,
        unitWidth: boxWidth,
        unitHeight: boxHeight,
      });
      return { ...zoomed, level: shownLevel };
    });
  }
  function moveChart(nextScale: number, pointX: number, pointY: number) {
    const { w, h } = chartSize();
    if (w < 8 || h < 8) return;
    const fit = mapFitScale(boxWidth, boxHeight, w, h);
    const next = clampMapScale(nextScale, fit);
    const pan = mapPanToPoint({
      focusX: pointX,
      focusY: pointY,
      originX,
      originY,
      scale: next,
      viewW: w,
      viewH: h,
      unitWidth: boxWidth,
      unitHeight: boxHeight,
    });
    setView({ scale: next, x: pan.x, y: pan.y, level: shownLevel });
  }
  function nudgeChart(dx: number, dy: number) {
    const { w, h } = chartSize();
    setView((current) => {
      if (!current) return current;
      return {
        ...current,
        x: clampMapPan(current.x + dx, w, boxWidth * current.scale),
        y: clampMapPan(current.y + dy, h, boxHeight * current.scale),
      };
    });
  }
  const fitted = chartPx.w > 8 ? mapFitScale(boxWidth, boxHeight, chartPx.w, chartPx.h) : scale;
  const zoomMin = Math.min(fitted, MAP_READABLE_SCALE);
  const zoomMax = Math.max(MAP_READABLE_SCALE * 2.5, fitted);
  return (
    <figure className={`minimap minimap-${size}`}>
      {size === "world" ? (
        <>
          <div className="map-zoom" role="group" aria-label="Chart zoom">
            <button
              type="button"
              onClick={() => zoomBy(1 / 1.25)}
              disabled={scale <= zoomMin + 0.5}
            >
              Zoom out
            </button>
            <button type="button" onClick={() => zoomBy(1.25)} disabled={scale >= zoomMax - 0.5}>
              Zoom in
            </button>
            <button
              type="button"
              onClick={() => moveChart(fitted, originX + boxWidth / 2, originY + boxHeight / 2)}
            >
              Whole floor
            </button>
            <button type="button" onClick={() => moveChart(MAP_READABLE_SCALE, focusX, focusY)}>
              Read names
            </button>
          </div>
          {tucked > 0 ? (
            <p className="map-zoom-note">
              {String(tucked)} {tucked === 1 ? "name is" : "names are"} tucked in. Zoom in to read
              that part.
            </p>
          ) : null}
          <div
            className="map-chart"
            ref={viewportRef}
            tabIndex={0}
            aria-label="World chart. Arrow keys pan. Plus and minus zoom. Home reads names around you. Zero shows the whole floor."
            onKeyDown={(event) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "+" || event.key === "=") {
                event.preventDefault();
                zoomBy(1.25);
              } else if (event.key === "-" || event.key === "_") {
                event.preventDefault();
                zoomBy(1 / 1.25);
              } else if (event.key === "0") {
                event.preventDefault();
                moveChart(fitted, originX + boxWidth / 2, originY + boxHeight / 2);
              } else if (event.key === "Home") {
                event.preventDefault();
                moveChart(MAP_READABLE_SCALE, focusX, focusY);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                nudgeChart(48, 0);
              } else if (event.key === "ArrowRight") {
                event.preventDefault();
                nudgeChart(-48, 0);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                nudgeChart(0, 48);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                nudgeChart(0, -48);
              }
            }}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              if (event.target instanceof Element && event.target.closest("button")) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              dragRef.current = {
                id: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                panX: view?.x ?? 0,
                panY: view?.y ?? 0,
                moved: false,
              };
            }}
            onPointerMove={(event) => {
              const drag = dragRef.current;
              if (!drag || drag.id !== event.pointerId) return;
              const dx = event.clientX - drag.x;
              const dy = event.clientY - drag.y;
              if (!drag.moved && Math.hypot(dx, dy) < 5) return;
              drag.moved = true;
              const { w, h } = chartSize();
              setView((current) => {
                if (!current) return current;
                return {
                  ...current,
                  x: clampMapPan(drag.panX + dx, w, boxWidth * current.scale),
                  y: clampMapPan(drag.panY + dy, h, boxHeight * current.scale),
                };
              });
            }}
            onPointerUp={(event) => {
              if (dragRef.current?.id === event.pointerId) dragRef.current = null;
            }}
          >
            <div
              className="map-stage"
              style={{
                width: `${String(boxWidth * scale)}px`,
                height: `${String(boxHeight * scale)}px`,
                transform: `translate(${String(view?.x ?? 0)}px, ${String(view?.y ?? 0)}px)`,
              }}
            >
              <div className="map-frame">
                {chart}
                <div className="map-labels">
                  {rooms.map((room) => {
                    const direction = state?.room.exits.find(
                      (exit) => exit.toRoomId === room.id,
                    )?.direction;
                    const place = mapPlaceMessage(room);
                    const canTravel = room.state === "explored" && Boolean(room.title);
                    const canPrepare = room.state !== "unknown" && Boolean(direction) && !canTravel;
                    const showName = visibleLabels.has(room.id);
                    const style = {
                      left: `${String(((room.x - originX) / boxWidth) * 100)}%`,
                      top: `${String(((room.y - originY) / boxHeight) * 100)}%`,
                    };
                    return (
                      <button
                        key={room.id}
                        type="button"
                        className={`map-room-label map-room-${room.state}${showName ? "" : " map-room-mark"}`}
                        style={style}
                        aria-label={
                          room.quest && room.state === "unknown"
                            ? "Quest. Fog still hides that place."
                            : (place ??
                              (canTravel
                                ? `Travel to ${room.title}${room.quest ? ". Quest" : ""}`
                                : canPrepare
                                  ? `Prepare go ${direction}`
                                  : room.title))
                        }
                        onClick={() => {
                          if (place) {
                            onPlaceMessage?.(place);
                            return;
                          }
                          if (canTravel && room.title) onTravel?.(room.title);
                          else if (canPrepare && direction) onPrepareMove?.(direction);
                        }}
                      >
                        {showName ? (
                          room.state === "unknown" ? (
                            <span className="map-quest">Quest</span>
                          ) : (
                            <>
                              <span className="map-room-name">{room.title}</span>
                              {room.quest ? <span className="map-quest">Quest</span> : null}
                              {room.state === "current" ? (
                                <span className="map-here">You are here</span>
                              ) : null}
                            </>
                          )
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        chart
      )}
      {size === "compact" ? (
        <figcaption className="minimap-level">{mapLevelLabel(shownLevel)}</figcaption>
      ) : (
        <>
          <figcaption>
            {mapLevelLabel(shownLevel)} · North ↑ · Ring marks you · Hatch is fog · {String(fog)}{" "}
            still hidden
          </figcaption>
          <details>
            <summary>
              Explored rooms ({explored.length}) · {fog} in fog
            </summary>
            <ul>
              {explored.map((room) => (
                <li key={room.id}>
                  {room.state === "explored" && room.title ? (
                    <button type="button" onClick={() => onTravel?.(room.title!)}>
                      Travel to {room.title}
                    </button>
                  ) : (
                    <>
                      {room.title}
                      {room.state === "current" ? " (you)" : ""}
                    </>
                  )}
                </li>
              ))}
            </ul>
            {fog > 0 ? (
              <p className="small-copy">{String(fog)} charted rooms remain unnamed in fog.</p>
            ) : null}
          </details>
        </>
      )}
    </figure>
  );
}

export function WorldMapDialog({
  open,
  state,
  onClose,
  onPrepareMove,
  onTravel,
}: {
  open: boolean;
  state?: PlayState;
  onClose: () => void;
  onPrepareMove?: (direction: string) => void;
  onTravel?: (title: string, report: (result: MapTravelResult) => void) => void;
}) {
  const currentLevel = mapLevel(
    state?.minimap.rooms.find((room) => room.state === "current") ?? {},
  );
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <WorldMapChart
      key={currentLevel}
      currentLevel={currentLevel}
      state={state}
      onClose={onClose}
      onPrepareMove={onPrepareMove}
      onTravel={onTravel}
    />
  );
}

function WorldMapChart({
  currentLevel,
  state,
  onClose,
  onPrepareMove,
  onTravel,
}: {
  currentLevel: number;
  state?: PlayState;
  onClose: () => void;
  onPrepareMove?: (direction: string) => void;
  onTravel?: (title: string, report: (result: MapTravelResult) => void) => void;
}) {
  const levels = availableMapLevels(state?.minimap.rooms ?? []);
  const [viewedLevel, setViewedLevel] = useState(currentLevel);
  const [notice, setNotice] = useState("");
  const upLevel = nextMapLevel(levels, viewedLevel, 1);
  const downLevel = nextMapLevel(levels, viewedLevel, -1);
  const canClimb = state?.room.exits.some((exit) => exit.direction === "up");
  const canDescend = state?.room.exits.some((exit) => exit.direction === "down");
  function requestTravel(title: string) {
    setNotice("");
    onTravel?.(title, (result) => {
      if (result.ok) onClose();
      else setNotice(result.message);
    });
  }
  return (
    <div className="world-map-overlay" onClick={onClose}>
      <div
        className="world-map-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="world-map-heading"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-heading">
          <h2 id="world-map-heading">World map</h2>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="small-copy">
          Each level has its own chart. Drag to move it, or zoom until the names have room. Fog
          hides names you have not earned. An explored room sends travel along known paths.
        </p>
        <nav className="map-level-nav" aria-label="Map levels">
          <button
            type="button"
            disabled={upLevel === undefined}
            onClick={() => {
              if (upLevel !== undefined) setViewedLevel(upLevel);
            }}
          >
            Up
          </button>
          <p>
            {mapLevelLabel(viewedLevel)}
            {viewedLevel === currentLevel ? " · you are here" : ""}
          </p>
          <button
            type="button"
            disabled={downLevel === undefined}
            onClick={() => {
              if (downLevel !== undefined) setViewedLevel(downLevel);
            }}
          >
            Down
          </button>
          {canClimb ? (
            <button type="button" onClick={() => onPrepareMove?.("up")}>
              Climb up
            </button>
          ) : null}
          {canDescend ? (
            <button type="button" onClick={() => onPrepareMove?.("down")}>
              Go down
            </button>
          ) : null}
        </nav>
        <p className="map-notice" role="status">
          {notice}
        </p>
        <Minimap
          state={state}
          size="world"
          level={viewedLevel}
          onPrepareMove={onPrepareMove}
          onTravel={requestTravel}
          onPlaceMessage={setNotice}
        />
      </div>
    </div>
  );
}
