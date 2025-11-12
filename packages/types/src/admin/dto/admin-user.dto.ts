import type { AuthUserSummary } from "../../auth/dto";

export interface AdminUserDto extends AuthUserSummary {
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
}
