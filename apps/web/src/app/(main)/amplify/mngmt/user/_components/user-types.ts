import { type AdminUserDto } from "@amplify/types/admin";

export type AdminUser = AdminUserDto & {
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  emailVerified?: string | Date | null;
  image?: string | null;
  metadata?: Record<string, unknown> | null;
};
