import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  logo: z
    .string()
    .url("Logo must be a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
  metadata: z
    .string()
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    }),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function safeParseMetadata(
  value: string | undefined,
): Record<string, unknown> | null | undefined {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return parsed;
  } catch {
    throw new Error("Metadata must be valid JSON.");
  }
}
