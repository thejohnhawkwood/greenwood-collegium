import { useEffect, useId, useState, type CSSProperties } from "react";
import type { PlayState } from "@greenwood/contracts";
import { availableMapLevels, mapLevel, mapLevelLabel, nextMapLevel } from "./map-levels.js";

type MapSize = "compact" | "world";
type MapRoom = PlayState["minimap"]["rooms"][number];

export type MapTravelResult = { ok: boolean; message: string };

/** Copy for a chart click that must not send travel. Explored rooms travel instead. */
export function mapPlaceMessage(room: {
  state: MapRoom["state"];
  title?: string;
}): string | undefined {
  if (room.state === "unknown") return "Fog still hides that place.";
  if (room.state === "current") {
    return room.title ? `You are already in ${room.title}.` : "You are already here.";
  }
  return undefined;
}

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
  const currentLevel = mapLevel(
    state?.minimap.rooms.find((room) => room.state === "current") ?? {},
  );
  const shownLevel = level ?? currentLevel;
  const rooms = (state?.minimap.rooms ?? [])
    .filter((room) => mapLevel(room) === shownLevel)
    .map((room) => ({ ...room, y: -room.y }));
  if (!rooms.length) return <p className="small-copy">No charted rooms on this level yet.</p>;
  const left = Math.min(...rooms.map((room) => room.x));
  const top = Math.min(...rooms.map((room) => room.y));
  const width = Math.max(...rooms.map((room) => room.x)) - left + 1;
  const height = Math.max(...rooms.map((room) => room.y)) - top + 1;
  const explored = rooms.filter((room) => room.state !== "unknown");
  const fog = rooms.length - explored.length;
  const label = `${mapLevelLabel(shownLevel)} map. You are in ${state?.room.title}. North is up. Explored rooms are marked; fog hides the rest.`;
  const boxWidth = width + 0.2;
  const boxHeight = height + 0.2;
  const originX = left - 0.6;
  const originY = top - 0.6;
  const frameStyle = { "--map-aspect": String(boxWidth / boxHeight) } as CSSProperties;
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
            {room.state === "unknown"
              ? "Unexplored"
              : `${room.title ?? "Explored"}${room.state === "current" ? " — You are here" : ""}`}
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
            stroke={room.state === "unknown" ? "#6f7d68" : "none"}
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
  return (
    <figure className={`minimap minimap-${size}`}>
      {size === "world" ? (
        <div className="map-chart">
          <div className="map-frame" style={frameStyle}>
            {chart}
            <div className="map-labels">
              {rooms.map((room) => {
                const direction = state?.room.exits.find(
                  (exit) => exit.toRoomId === room.id,
                )?.direction;
                const place = mapPlaceMessage(room);
                const canTravel = room.state === "explored" && Boolean(room.title);
                const canPrepare = room.state !== "unknown" && Boolean(direction) && !canTravel;
                const style = {
                  left: `${String(((room.x - originX) / boxWidth) * 100)}%`,
                  top: `${String(((room.y - originY) / boxHeight) * 100)}%`,
                };
                return (
                  <button
                    key={room.id}
                    type="button"
                    className={`map-room-label map-room-${room.state}`}
                    style={style}
                    aria-label={
                      place ??
                      (canTravel
                        ? `Travel to ${room.title}`
                        : canPrepare
                          ? `Prepare go ${direction}`
                          : room.title)
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
                    {room.state === "unknown" ? (
                      <span aria-hidden="true">·</span>
                    ) : (
                      <>
                        <span className="map-room-name">{room.title}</span>
                        {room.state === "current" ? (
                          <span className="map-here">You are here</span>
                        ) : null}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
          Each level has its own chart. Fog hides names you have not earned. An explored room sends
          travel along known paths.
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
