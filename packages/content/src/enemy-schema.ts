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

export const enemyTemplateSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    name: z.string().min(1),
    shortDescription: z.string().min(1),
    examineDescription: z.string().min(1),
    maxHealth: z.number().int().positive(),
    attack: z.number().int().positive(),
    experience: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((enemy, ctx) => {
    rejectMarkup(enemy.name, "name", ctx);
    rejectMarkup(enemy.shortDescription, "shortDescription", ctx);
    rejectMarkup(enemy.examineDescription, "examineDescription", ctx);
  });

export const enemyPlacementSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    templateId: stableIdSchema,
    roomId: stableIdSchema,
  })
  .strict();

export type EnemyTemplate = z.infer<typeof enemyTemplateSchema>;
export type EnemyPlacement = z.infer<typeof enemyPlacementSchema>;
