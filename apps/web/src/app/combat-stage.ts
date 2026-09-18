import type { CharacterVisual, PlayState } from "@greenwood/contracts";

export function secondsLeft(lockDeadlineAt: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((Date.parse(lockDeadlineAt) - now) / 1000));
}

export function encounterFoeVisual(
  encounter: NonNullable<PlayState["encounter"]>,
  sources?: {
    peers?: readonly { id: string; visual?: CharacterVisual }[];
    room?: { visible: readonly { id: string; visual?: CharacterVisual }[] };
  },
): CharacterVisual | undefined {
  return (
    sources?.peers?.find((peer) => peer.id === encounter.enemy.id)?.visual ??
    sources?.room?.visible.find((entity) => entity.id === encounter.enemy.id)?.visual
  );
}
