import { z } from "zod";

const stableIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z][a-z0-9-]*$/, "stable ids must be kebab-case");

const htmlOrScript = /<[a-z/]|javascript:/i;

function rejectMarkup(value: string, label: string, ctx: z.RefinementCtx): void {
  if (htmlOrScript.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be plain text without HTML or scripts`,
    });
  }
}

export const questObjectiveSchema = z
  .object({
    id: stableIdSchema,
    kind: z.enum(["look", "say", "take", "visit"]),
    label: z.string().min(1),
    itemTemplateId: stableIdSchema.optional(),
    roomId: stableIdSchema.optional(),
  })
  .strict()
  .superRefine((objective, ctx) => {
    rejectMarkup(objective.label, "label", ctx);
    if (objective.kind === "take" && !objective.itemTemplateId) {
      ctx.addIssue({
        code: "custom",
        message: "take objectives need itemTemplateId",
      });
    }
    if (objective.kind === "visit" && !objective.roomId) {
      ctx.addIssue({
        code: "custom",
        message: "visit objectives need roomId",
      });
    }
  });

export const questTemplateSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    title: z.string().min(1),
    introNarration: z.string().min(1),
    reminderNarration: z.string().min(1),
    experienceReward: z.number().int().positive(),
    objectives: z.array(questObjectiveSchema).min(1),
  })
  .strict()
  .superRefine((quest, ctx) => {
    rejectMarkup(quest.title, "title", ctx);
    rejectMarkup(quest.introNarration, "introNarration", ctx);
    rejectMarkup(quest.reminderNarration, "reminderNarration", ctx);
  });

export type QuestTemplate = z.infer<typeof questTemplateSchema>;
