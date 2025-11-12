import type { AuthUserSummary } from "../../auth/dto";

export interface OrganizationMemberDto {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: AuthUserSummary;
}
