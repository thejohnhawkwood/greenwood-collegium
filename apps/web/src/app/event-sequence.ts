export const BOOT_ID_STORAGE_KEY = "greenwood.bootId";

export function shouldApplyEvent(lastSequence: number, incomingSequence: number): boolean {
  return incomingSequence > lastSequence;
}

export function applyProcessHello(
  storedBootId: string | null,
  incomingBootId: string,
  lastSequence: number,
): { bootId: string; lastSequence: number; reset: boolean } {
  if (storedBootId === incomingBootId) {
    return { bootId: incomingBootId, lastSequence, reset: false };
  }
  return { bootId: incomingBootId, lastSequence: 0, reset: true };
}

export function shouldResyncAfterAck(
  lastSequence: number,
  eventSequenceEnd: number | undefined,
): boolean {
  return eventSequenceEnd !== undefined && eventSequenceEnd < lastSequence;
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

export function readStoredBootId(storage: Pick<Storage, "getItem">): string | null {
  return storage.getItem(BOOT_ID_STORAGE_KEY);
}

export function writeStoredBootId(storage: Pick<Storage, "setItem">, bootId: string): void {
  storage.setItem(BOOT_ID_STORAGE_KEY, bootId);
}
