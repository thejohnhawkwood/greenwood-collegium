import {
  playStateSchema,
  resolveAppearance,
  resolveVisualGender,
  type PlayState,
} from "@greenwood/contracts";
import {
  activeEncounter,
  DEFAULT_PLAYER_MAX_HEALTH,
  DEFAULT_PLAYER_MAX_FOCUS,
} from "./combat-state.js";
import { snapshotPayload } from "./look.js";
import type { WorldState } from "./state.js";

/** Read-only projection. No accounts, hidden rooms, or other players' private stats. */
export function createPlayState(
  world: WorldState,
  characterId: string,
  options?: { presentIds?: readonly string[] },
): PlayState | undefined {
  const character = world.characters[characterId];
  const room = character && world.rooms[character.roomId];
  if (!character || !room) return undefined;
  const equipped = character.equippedItemId
    ? (Object.values(world.items ?? {}).find(
        (item) =>
          item.id === character.equippedItemId || item.templateId === character.equippedItemId,
      )?.name ?? world.itemTemplates?.[character.equippedItemId]?.name)
    : undefined;
  const discovered = new Set([...character.discoveredRoomIds, room.id]);
  const mappedRooms = Object.values(world.rooms).filter((candidate) => candidate.map);
  const mappedIds = new Set(mappedRooms.map((candidate) => candidate.id));
  return playStateSchema.parse({
    minimap: {
      rooms: mappedRooms.map((candidate) => {
        const current = candidate.id === room.id;
        const known = discovered.has(candidate.id);
        return {
          id: candidate.id,
          ...candidate.map!,
          state: current ? "current" : known ? "explored" : "unknown",
          ...(current || known ? { title: candidate.title } : {}),
        };
      }),
      paths: mappedRooms.flatMap((candidate) =>
        candidate.exits
          .filter((exit) => mappedIds.has(exit.toRoomId))
          .map((exit) => ({ from: candidate.id, to: exit.toRoomId })),
      ),
    },
    character: {
      id: character.id,
      name: character.name,
      visual: {
        speciesId: character.speciesId ?? "unknown",
        gender: resolveVisualGender(character.gender),
        appearance: resolveAppearance(character.appearance),
      },
      health: character.health ?? DEFAULT_PLAYER_MAX_HEALTH,
      maxHealth: character.maxHealth ?? DEFAULT_PLAYER_MAX_HEALTH,
      focus: character.focus ?? DEFAULT_PLAYER_MAX_FOCUS,
      maxFocus: character.maxFocus ?? DEFAULT_PLAYER_MAX_FOCUS,
      level: character.level ?? 1,
      experience: character.experience ?? 0,
      inCombat: Boolean(activeEncounter(world, characterId)),
      equipped,
    },
    // Older world fixtures omit these collections. The shared look helpers lazily
    // initialise them, so isolate that initialisation from this read-only projection.
    room: snapshotPayload(
      room,
      { ...world, items: world.items ?? {}, enemies: world.enemies ?? {} },
      character,
    ),
    peers: (options?.presentIds ?? [])
      .filter((id) => id !== characterId)
      .flatMap((id) => {
        const other = world.characters[id];
        if (!other) return [];
        const theirRoom = world.rooms[other.roomId];
        return [
          {
            id: other.id,
            name: other.name,
            visual: {
              speciesId: other.speciesId ?? "unknown",
              gender: resolveVisualGender(other.gender),
              appearance: resolveAppearance(other.appearance),
            },
            ...(theirRoom && discovered.has(theirRoom.id) ? { roomTitle: theirRoom.title } : {}),
          },
        ];
      }),
  });
}
