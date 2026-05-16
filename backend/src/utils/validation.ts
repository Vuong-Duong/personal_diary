import { z } from "zod";

/**
 * Auth Validation Schemas
 */

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/**
 * Post Validation Schemas
 */

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5000 characters"),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PUBLIC"),
  isAnonymous: z.boolean().optional().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export const updatePostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5000 characters")
    .optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  isAnonymous: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

export const publishPostSchema = z.object({
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});

/**
 * Comment Validation Schemas
 */

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters"),
});

/**
 * User Validation Schemas
 */

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional().nullable(),
});

/**
 * Utility function to validate data
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: boolean; data?: T; error?: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors[0]?.message || "Validation failed";
      return { success: false, error: message };
    }
    return { success: false, error: "Unknown validation error" };
  }
}
