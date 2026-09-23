import type { PlayState } from "@greenwood/contracts";
import { npcArtSrc } from "./npc-plates.js";
import { objectArtSrc } from "./object-plates.js";
import { isHostile, type PresencePerson } from "./presence-actions.js";

export function tokenKind(person: PresencePerson): "npc" | "player" | "object" | "hostile" {
  if (isHostile(person)) return "hostile";
  return person.kind;
}

export function handOverlap(count: number): number {
  if (count <= 7) return 0;
  if (count <= 12) return -16;
  if (count <= 20) return -28;
  return -38;
}

export function isConversationVisible(
  conversation: PlayState["conversation"] | undefined,
  dismissedNpcId: string | null,
): conversation is NonNullable<PlayState["conversation"]> {
  return Boolean(conversation && conversation.npcId !== dismissedNpcId);
}

export function forcedPresenceId(
  people: readonly PresencePerson[],
  _conversation?: PlayState["conversation"],
  inCombat?: boolean,
): string | undefined {
  if (inCombat) {
    return people.find((person) => isHostile(person))?.id;
  }
  return undefined;
}

export function plateSrc(person: PresencePerson): string | undefined {
  return person.kind === "object" ? objectArtSrc(person.id, person.name) : npcArtSrc(person.id);
}
