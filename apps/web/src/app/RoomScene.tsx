import { roomArtSrc } from "./portrait-layers.js";

/** Painted room plate. Title, entities and exits stay HTML from the server. */
export function RoomScene({ visualState, label }: { visualState?: string; label?: string }) {
  if (!visualState) {
    return <div className="room-illustration room-illustration-empty" aria-hidden="true" />;
  }
  const decorative = !label;
  return (
    <div className="room-illustration" aria-hidden={decorative ? true : undefined}>
      <img src={roomArtSrc(visualState)} alt={label ?? ""} />
    </div>
  );
}
