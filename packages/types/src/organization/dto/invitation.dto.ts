export type OrganizationInvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "canceled";

export interface OrganizationInvitationDto {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: OrganizationInvitationStatus;
  teamId?: string | null;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
