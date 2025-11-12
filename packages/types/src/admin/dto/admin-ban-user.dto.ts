export interface AdminBanUserDto {
  userId: string;
  reason?: string | null;
  expiresAt?: string | null;
}
