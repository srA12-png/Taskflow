import { z } from "zod";

const optionalIsoDate = z
  .union([
    z.null(),
    z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Enter a valid date",
    }),
  ])
  .optional()
  .transform((value) => value ?? null);

const optionalCategoryId = z
  .union([z.null(), z.number().int().positive("Category is invalid")])
  .optional()
  .transform((value) => value ?? null);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .union([z.null(), z.string().trim().max(2000, "Description is too long")])
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  categoryId: optionalCategoryId,
  dueAt: optionalIsoDate,
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().trim().max(120).optional(),
  status: z
    .enum(["all", "pending", "in_progress", "completed"])
    .default("all"),
  priority: z.enum(["all", "low", "medium", "high"]).default("all"),
  categoryId: z.coerce.number().int().positive().optional(),
  due: z.enum(["all", "today", "upcoming", "overdue"]).default("all"),
  sort: z.enum(["newest", "oldest", "due", "priority"]).default("newest"),
  tzOffset: z.coerce.number().int().min(-840).max(840).default(0),
});

export const taskIdSchema = z.object({
  id: z.coerce.number().int().positive("Task id is invalid"),
});
