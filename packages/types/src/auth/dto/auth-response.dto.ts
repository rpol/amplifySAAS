export interface AuthUserSummary {
  id: string;
  email: string;
  name: string;
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  maxAge: number;
  user: AuthUserSummary;
  impersonatedBy?: string | null;
}
