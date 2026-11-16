import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Category name is required")
  .max(40, "Category name must be at most 40 characters");

const colorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #6366F1");

export const createCategorySchema = z.object({
  name: nameSchema,
  color: colorSchema.default("#6366F1"),
});

export const updateCategorySchema = z
  .object({
    name: nameSchema.optional(),
    color: colorSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const categoryIdSchema = z.object({
  id: z.coerce.number().int().positive("Category id is invalid"),
});
