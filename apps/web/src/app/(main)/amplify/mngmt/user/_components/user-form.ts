import { z } from "zod";

const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Email must be valid"),
  role: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : undefined;
    }),
  data: z
    .string()
    .optional()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed && trimmed.length > 0 ? trimmed : undefined;
    }),
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const updateUserSchema = baseUserSchema.extend({
  password: z
    .union([
      z.string().min(8, "Password must be at least 8 characters long"),
      z.literal(""),
    ])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

export function safeParseUserData(
  value?: string
): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error();
    }
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("Additional data must be valid JSON object.");
  }
}
