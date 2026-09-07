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

export const itemTemplateSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    name: z.string().min(1),
    shortDescription: z.string().min(1),
    examineDescription: z.string().min(1),
    category: z.enum(["key", "book", "ordinary"]),
    unique: z.literal(true).default(true),
  })
  .strict()
  .superRefine((item, ctx) => {
    rejectMarkup(item.name, "name", ctx);
    rejectMarkup(item.shortDescription, "shortDescription", ctx);
    rejectMarkup(item.examineDescription, "examineDescription", ctx);
  });

export const itemPlacementSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    templateId: stableIdSchema,
    roomId: stableIdSchema,
  })
  .strict();

export type ItemTemplate = z.infer<typeof itemTemplateSchema>;
export type ItemPlacement = z.infer<typeof itemPlacementSchema>;
