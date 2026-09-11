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
    category: z.enum(["key", "book", "weapon", "ordinary"]),
    itemType: z.enum(["key", "book", "weapon", "sword", "staff", "sling", "ordinary"]).optional(),
    training: z.boolean().optional(),
    unique: z.literal(true).default(true),
  })
  .strict()
  .superRefine((item, ctx) => {
    rejectMarkup(item.name, "name", ctx);
    rejectMarkup(item.shortDescription, "shortDescription", ctx);
    rejectMarkup(item.examineDescription, "examineDescription", ctx);
    const primitive =
      item.itemType ?? (item.category === "weapon" ? undefined : item.category);
    if (item.category === "weapon" && !item.itemType) {
      ctx.addIssue({ code: "custom", message: "weapon items must declare itemType" });
    }
    if (primitive && !item.name.toLowerCase().includes(primitive)) {
      ctx.addIssue({
        code: "custom",
        message: `item name must include its type word "${primitive}"`,
      });
    }
  });

export const itemPlacementSchema = z
  .object({
    $schema: z.string().optional(),
    id: stableIdSchema,
    templateId: stableIdSchema,
    roomId: stableIdSchema,
    starterPerCharacter: z.boolean().optional(),
  })
  .strict();

export type ItemTemplate = z.infer<typeof itemTemplateSchema>;
export type ItemPlacement = z.infer<typeof itemPlacementSchema>;
