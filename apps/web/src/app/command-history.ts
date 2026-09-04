export type HistoryRecall = {
  cursor: number | null;
  draft: string;
  value: string;
};

export function pushCommandHistory(entries: readonly string[], raw: string): string[] {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return [...entries];
  }
  return [...entries, trimmed];
}

export function recallCommandHistory(
  entries: readonly string[],
  cursor: number | null,
  draft: string,
  value: string,
  direction: "up" | "down",
): HistoryRecall {
  if (entries.length === 0) {
    return { cursor: null, draft, value };
  }

  if (direction === "up") {
    const nextDraft = cursor === null ? value : draft;
    const nextCursor = cursor === null ? entries.length - 1 : Math.max(0, cursor - 1);
    return { cursor: nextCursor, draft: nextDraft, value: entries[nextCursor] ?? nextDraft };
  }

  if (cursor === null) {
    return { cursor: null, draft, value };
  }

  if (cursor >= entries.length - 1) {
    return { cursor: null, draft, value: draft };
  }

  const nextCursor = cursor + 1;
  return { cursor: nextCursor, draft, value: entries[nextCursor] ?? draft };
}
