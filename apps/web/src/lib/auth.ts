export const SESSION_COOKIE_NAME = "amplify_session";

export const DEFAULT_AUTH_REDIRECT = "/amplify/default";

export const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.AUTH_API_URL ??
  "http://localhost:3001";

export type { AuthResponse } from "@amplify/types";

export function calculateCookieMaxAge(
  expiresAt: string,
  fallbackSeconds = 60 * 60 * 24 * 7,
): number {
  // Ensure cookie expiration stays in sync with server session expiry.
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
