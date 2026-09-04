export type TranscriptKind = "command" | "narration" | "notice";

export type TranscriptLine = {
  id: string;
  kind: TranscriptKind;
  text: string;
};

export function appendTranscript(
  lines: readonly TranscriptLine[],
  line: TranscriptLine,
): TranscriptLine[] {
  return [...lines, line];
}
