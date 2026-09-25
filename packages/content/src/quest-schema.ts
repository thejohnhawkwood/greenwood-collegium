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
    kind: z.enum(["look", "say", "take", "visit", "examine", "talk", "defeat", "cast"]),
    label: z.string().min(1),
    itemTemplateId: stableIdSchema.optional(),
    roomId: stableIdSchema.optional(),
    targetId: stableIdSchema.optional(),
    requires: z.array(stableIdSchema).min(1).optional(),
    outcome: stableIdSchema.optional(),
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
    if ((objective.kind === "defeat" || objective.kind === "cast") && !objective.targetId) {
      ctx.addIssue({ code: "custom", message: "defeat and cast objectives need targetId" });
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

/** H1. A remembered fork: the objective a Collegian finishes decides the ending. */
export const questOutcomeSchema = z
  .object({
    id: stableIdSchema,
    completionNarration: z.string().min(1),
    itemRewardTemplateId: stableIdSchema.optional(),
  })
  .strict()
  .superRefine((outcome, ctx) => {
    rejectMarkup(outcome.completionNarration, "completionNarration", ctx);
  });

export const questTemplateSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    title: z.string().min(1),
    introNarration: z.string().min(1),
    reminderNarration: z.string().min(1),
    giverNpcId: stableIdSchema.optional(),
    requiresQuestIds: z.array(stableIdSchema).min(1).optional(),
    completionNarration: z.string().min(1).optional(),
    experienceReward: z.number().int().positive(),
    itemRewardTemplateId: stableIdSchema.optional(),
    outcomes: z.array(questOutcomeSchema).min(2).optional(),
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
    if (
      quest.requiresQuestIds &&
      new Set(quest.requiresQuestIds).size !== quest.requiresQuestIds.length
    ) {
      ctx.addIssue({ code: "custom", message: "requiresQuestIds must be unique" });
    }
    const outcomeIds = new Set((quest.outcomes ?? []).map((outcome) => outcome.id));
    if (quest.outcomes && outcomeIds.size !== quest.outcomes.length) {
      ctx.addIssue({ code: "custom", message: "outcome ids must be unique" });
    }
    if (quest.outcomes && quest.completionNarration) {
      ctx.addIssue({
        code: "custom",
        message: "a quest with outcomes narrates completion per outcome, not once",
      });
    }
    if (quest.outcomes && quest.itemRewardTemplateId) {
      ctx.addIssue({
        code: "custom",
        message: "a quest with outcomes rewards per outcome, not once",
      });
    }
    const tagged = new Set<string>();
    for (const objective of quest.objectives) {
      if (!objective.outcome) {
        continue;
      }
      tagged.add(objective.outcome);
      if (!outcomeIds.has(objective.outcome)) {
        ctx.addIssue({
          code: "custom",
          message: `${objective.id} names an unknown outcome: ${objective.outcome}`,
        });
      }
    }
    for (const id of outcomeIds) {
      if (!tagged.has(id)) {
        ctx.addIssue({ code: "custom", message: `no objective reaches outcome ${id}` });
      }
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
