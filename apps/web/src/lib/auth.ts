export const SESSION_COOKIE_NAME = "amplify_session";

export const DEFAULT_AUTH_REDIRECT = "/dashboard/default";

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.AUTH_API_URL ??
  "http://localhost:3001";

export interface AuthResponse {
  token: string;
  expiresAt: string;
  maxAge: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export function calculateCookieMaxAge(
  expiresAt: string,
  fallbackSeconds = 60 * 60 * 24 * 7,
): number {
  const expiresAtDate = new Date(expiresAt);
  const diff = Math.floor((expiresAtDate.getTime() - Date.now()) / 1000);
  return Number.isFinite(diff) && diff > 0 ? diff : fallbackSeconds;
}

export function resolveRedirectPath(path?: string | null): string {
  if (!path) return DEFAULT_AUTH_REDIRECT;
  if (!path.startsWith("/")) return DEFAULT_AUTH_REDIRECT;
  if (path.startsWith("//")) return DEFAULT_AUTH_REDIRECT;
  if (path.startsWith("/auth")) return DEFAULT_AUTH_REDIRECT;
  return path;
}
