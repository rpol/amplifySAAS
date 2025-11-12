export interface AdminImpersonationSessionDto {
  token: string;
  expiresAt: string;
  impersonatedBy: string;
}
