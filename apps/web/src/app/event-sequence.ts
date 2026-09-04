export function shouldApplyEvent(lastSequence: number, incomingSequence: number): boolean {
  return incomingSequence > lastSequence;
}

export function sequenceStorageKey(characterId: string): string {
  return `greenwood.sequence.${characterId}`;
}

export function readStoredSequence(storage: Pick<Storage, "getItem">, characterId: string): number {
  const raw = storage.getItem(sequenceStorageKey(characterId));
  const parsed = raw === null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function writeStoredSequence(
  storage: Pick<Storage, "setItem">,
  characterId: string,
  sequence: number,
): void {
  storage.setItem(sequenceStorageKey(characterId), String(sequence));
}
