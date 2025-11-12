export const DEFAULT_AUTH_REDIRECT = "/amplify/default";

const betterAuthBaseUrlInput =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  process.env.BETTER_AUTH_API_URL ??
  undefined;

const betterAuthBasePathInput =
  process.env.NEXT_PUBLIC_BETTER_AUTH_PATH ??
  process.env.BETTER_AUTH_API_PATH ??
  "/api/auth";

function toAbsoluteUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).toString().replace(/\/+$/, "");
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[better-auth] Ignoring invalid Better Auth base URL. Provide an absolute URL instead. Received: ${value}`,
        error,
      );
    }
    return undefined;
  }
}

function normalizePath(pathValue: string): string {
  const trimmed = pathValue.trim();
  if (!trimmed) return "/api/auth";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export const BETTER_AUTH_BASE_URL = toAbsoluteUrl(betterAuthBaseUrlInput);

export const BETTER_AUTH_BASE_PATH = normalizePath(betterAuthBasePathInput);

export type { AuthResponse } from "@amplify/types";

export function resolveRedirectPath(path?: string | null): string {
  if (!path) return DEFAULT_AUTH_REDIRECT;
  if (!path.startsWith("/")) return DEFAULT_AUTH_REDIRECT;
  if (path.startsWith("//")) return DEFAULT_AUTH_REDIRECT;
  if (path.startsWith("/auth")) return DEFAULT_AUTH_REDIRECT;
  return path;
}
