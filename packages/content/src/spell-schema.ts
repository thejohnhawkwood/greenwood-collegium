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

export const spellTemplateSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    name: z.string().min(1),
    school: z.string().min(1),
    description: z.string().min(1),
    focusCost: z.number().int().nonnegative(),
    targetType: z.enum(["enemy", "self"]),
    context: z.enum(["encounter", "any"]),
    damage: z.number().int().nonnegative().optional(),
    effect: z
      .enum([
        "skip-counter",
        "avoid-hit",
        "heal",
        "brace",
        "ready-strike",
        "riposte",
        "insight",
        "restore-focus",
        "halve-hit",
        "weaken",
        "ready-spell",
        "leech",
      ])
      .optional(),
    heal: z.number().int().positive().optional(),
    insight: z.string().min(1).optional(),
    burningRounds: z.number().int().positive().optional(),
    burningDamage: z.number().int().positive().optional(),
    restoreFocus: z.number().int().positive().optional(),
    readySpellIds: z.array(stableIdSchema).min(1).optional(),
    minLevel: z.number().int().positive().optional(),
    tag: z.enum(["strike", "control", "ward", "gift"]).optional(),
    pennedBy: z.string().min(1).optional(),
    ranks: z
      .array(
        z
          .object({
            focusCost: z.number().int().nonnegative().optional(),
            damage: z.number().int().nonnegative().optional(),
            heal: z.number().int().positive().optional(),
            burningRounds: z.number().int().positive().optional(),
            burningDamage: z.number().int().positive().optional(),
            restoreFocus: z.number().int().positive().optional(),
            insight: z.string().min(1).optional(),
            marginNote: z.string().min(1).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(5)
      .optional(),
    presentationKey: z.string().min(1),
    helpText: z.string().min(1),
  })
  .strict()
  .superRefine((spell, ctx) => {
    rejectMarkup(spell.name, "name", ctx);
    rejectMarkup(spell.school, "school", ctx);
    rejectMarkup(spell.description, "description", ctx);
    rejectMarkup(spell.helpText, "helpText", ctx);
    rejectMarkup(spell.presentationKey, "presentationKey", ctx);
    if (spell.insight) {
      rejectMarkup(spell.insight, "insight", ctx);
    }
    if (spell.pennedBy) {
      rejectMarkup(spell.pennedBy, "pennedBy", ctx);
    }
    for (const rank of spell.ranks ?? []) {
      if (rank.insight) {
        rejectMarkup(rank.insight, "insight", ctx);
      }
      if (rank.marginNote) {
        rejectMarkup(rank.marginNote, "marginNote", ctx);
      }
    }
  });

export type SpellTemplate = z.infer<typeof spellTemplateSchema>;
