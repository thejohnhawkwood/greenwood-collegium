import { useEffect, useId } from "react";
import type { PlayState } from "@greenwood/contracts";

type MapSize = "compact" | "world";

export function Minimap({
  state,
  size = "compact",
  onPrepareMove,
  onTravel,
}: {
  state?: PlayState;
  size?: MapSize;
  onPrepareMove?: (direction: string) => void;
  onTravel?: (title: string) => void;
}) {
  const patternId = useId();
  const rooms = (state?.minimap.rooms ?? []).map((room) => ({ ...room, y: -room.y }));
  if (!rooms.length) return <p className="small-copy">No charted rooms here yet.</p>;
  const left = Math.min(...rooms.map((room) => room.x));
  const top = Math.min(...rooms.map((room) => room.y));
  const width = Math.max(...rooms.map((room) => room.x)) - left + 1;
  const height = Math.max(...rooms.map((room) => room.y)) - top + 1;
  const explored = rooms.filter((room) => room.state !== "unknown");
  const fog = rooms.length - explored.length;
  const label = `Collegium map. You are in ${state?.room.title}. North is up. Explored rooms are marked; fog hides the rest.`;
  return (
    <figure className={`minimap minimap-${size}`}>
      <svg
        viewBox={`${String(left - 0.6)} ${String(top - 0.6)} ${String(width + 0.2)} ${String(height + 0.2)}`}
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
        {rooms.map((room) => {
          const direction = state?.room.exits.find((exit) => exit.toRoomId === room.id)?.direction;
          const canTravel = size === "world" && room.state === "explored" && room.title;
          const canPrepare =
            size === "world" && room.state !== "unknown" && direction && !canTravel;
          return (
            <g key={room.id}>
              <title>
                {room.state === "unknown"
                  ? "Unexplored"
                  : `${room.title ?? "Explored"}${room.state === "current" ? " — You are here" : ""}`}
              </title>
              {canTravel || canPrepare ? (
                <rect
                  className="map-cell-button"
                  x={room.x - 0.16}
                  y={room.y - 0.16}
                  width="0.32"
                  height="0.32"
                  rx="0.04"
                  fill="transparent"
                  role="button"
                  tabIndex={0}
                  aria-label={canTravel ? `Travel to ${room.title}` : `Prepare go ${direction}`}
                  onClick={() =>
                    canTravel ? onTravel?.(room.title!) : onPrepareMove?.(direction!)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      if (canTravel) onTravel?.(room.title!);
                      else onPrepareMove?.(direction!);
                    }
                  }}
                />
              ) : null}
              <rect
                x={room.x - 0.13}
                y={room.y - 0.13}
                width="0.26"
                height="0.26"
                rx="0.04"
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
                />
              ) : null}
              {size === "world" && room.title ? (
                <text
                  x={room.x}
                  y={room.y + 0.28}
                  textAnchor="middle"
                  fontSize="0.11"
                  fill="#e8e4cf"
                >
                  {room.title}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {size === "world" ? (
        <>
          <figcaption>
            North ↑ · Ring marks you · Hatch is fog · {String(fog)} still hidden
          </figcaption>
          <details open>
            <summary>
              Explored rooms ({explored.length}) · {fog} in fog
            </summary>
            <ul>
              {explored.map((room) => (
                <li key={room.id}>
                  {room.title}
                  {room.state === "current" ? " (you)" : ""}
                </li>
              ))}
            </ul>
            {fog > 0 ? (
              <p className="small-copy">{String(fog)} charted rooms remain unnamed in fog.</p>
            ) : null}
          </details>
        </>
      ) : null}
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
  onTravel?: (title: string) => void;
}) {
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
          Fog hides names you have not earned. An explored room sends travel along known paths.
        </p>
        <Minimap state={state} size="world" onPrepareMove={onPrepareMove} onTravel={onTravel} />
      </div>
    </div>
  );
}
