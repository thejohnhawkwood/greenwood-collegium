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
    kind: z.enum(["look", "say", "take", "visit", "examine", "talk"]),
    label: z.string().min(1),
    itemTemplateId: stableIdSchema.optional(),
    roomId: stableIdSchema.optional(),
    targetId: stableIdSchema.optional(),
    requires: z.array(stableIdSchema).min(1).optional(),
  })
  .strict()
  .superRefine((objective, ctx) => {
    rejectMarkup(objective.label, "label", ctx);
    if (objective.requires && new Set(objective.requires).size !== objective.requires.length) {
      ctx.addIssue({ code: "custom", message: "objective dependencies must be unique" });
    }
    if ((objective.kind === "examine" || objective.kind === "talk") && !objective.targetId) {
      ctx.addIssue({ code: "custom", message: "examine and talk objectives need targetId" });
    }
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
    giverNpcId: stableIdSchema.optional(),
    completionNarration: z.string().min(1).optional(),
    experienceReward: z.number().int().positive(),
    objectives: z.array(questObjectiveSchema).min(1),
  })
  .strict()
  .superRefine((quest, ctx) => {
    rejectMarkup(quest.title, "title", ctx);
    rejectMarkup(quest.introNarration, "introNarration", ctx);
    rejectMarkup(quest.reminderNarration, "reminderNarration", ctx);
    if (quest.completionNarration) {
      rejectMarkup(quest.completionNarration, "completionNarration", ctx);
    }
    const earlierIds = new Set<string>();
    for (const objective of quest.objectives) {
      if (earlierIds.has(objective.id)) {
        ctx.addIssue({ code: "custom", message: `duplicate objective id ${objective.id}` });
      }
      for (const required of objective.requires ?? []) {
        if (!earlierIds.has(required)) {
          ctx.addIssue({
            code: "custom",
            message: `${objective.id} requires an earlier objective: ${required}`,
          });
        }
      }
      earlierIds.add(objective.id);
    }
  });

export type QuestTemplate = z.infer<typeof questTemplateSchema>;
