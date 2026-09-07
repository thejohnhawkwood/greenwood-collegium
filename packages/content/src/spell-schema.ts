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
    targetType: z.literal("enemy"),
    context: z.literal("encounter"),
    damage: z.number().int().positive(),
    burningRounds: z.number().int().positive(),
    burningDamage: z.number().int().positive(),
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
  });

export type SpellTemplate = z.infer<typeof spellTemplateSchema>;
