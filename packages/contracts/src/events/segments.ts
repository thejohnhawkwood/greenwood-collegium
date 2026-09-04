import { z } from "zod";

export const semanticKindSchema = z.enum([
  "text",
  "actor",
  "target",
  "location",
  "item",
  "spell",
  "damage",
  "healing",
  "quest",
  "system",
  "danger",
  "command",
]);

export const semanticSegmentSchema = z.object({
  kind: semanticKindSchema,
  text: z.string().min(1),
  id: z.string().min(1).optional(),
});

export type SemanticKind = z.infer<typeof semanticKindSchema>;
export type SemanticSegment = z.infer<typeof semanticSegmentSchema>;

export function renderClassicSegments(segments: readonly SemanticSegment[]): string {
  return segments.map((segment) => segment.text).join("");
}
