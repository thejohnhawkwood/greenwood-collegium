export type PendingCommand = {
  commandId: string;
  raw: string;
};

export function pendingAfterAck(
  pending: PendingCommand | undefined,
  commandId: string,
): PendingCommand | undefined {
  return pending?.commandId === commandId ? undefined : pending;
}
