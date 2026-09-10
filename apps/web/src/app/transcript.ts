import type { EventEnvelope } from "@greenwood/contracts";
export type TranscriptKind = "command" | "narration" | "notice";

export type TranscriptLine = {
  id: string;
  kind: TranscriptKind;
  text: string;
  event?: EventEnvelope;
};

export function appendTranscript(
  lines: readonly TranscriptLine[],
  line: TranscriptLine,
): TranscriptLine[] {
  return [...lines, line];
}
