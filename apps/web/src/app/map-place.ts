import type { PlayState } from "@greenwood/contracts";

type MapRoom = PlayState["minimap"]["rooms"][number];

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
