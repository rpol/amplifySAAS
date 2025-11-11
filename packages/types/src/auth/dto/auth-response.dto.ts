export interface AuthUserSummary {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  maxAge: number;
  user: AuthUserSummary;
}
