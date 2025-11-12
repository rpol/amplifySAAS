"use server";

import { cookies } from "next/headers";

import { auth } from "@amplify/auth";
import { type AuthResponse } from "@amplify/types";

export async function getValueFromCookie(
  key: string,
): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(key)?.value;
}

export async function setValueToCookie(
  key: string,
  value: string,
  options: {
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {},
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(key, value, {
    path: options.path ?? "/",
    // default: 7 days
    maxAge: options.maxAge ?? 60 * 60 * 24 * 7,
    httpOnly: options.httpOnly ?? true,
    secure:
      options.secure ??
      (typeof process !== "undefined" && process.env.NODE_ENV === "production"),
    sameSite: options.sameSite ?? "lax",
  });
}

export async function getPreference<T extends string>(
  key: string,
  allowed: readonly T[],
  fallback: T,
): Promise<T> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(key);
  const value = cookie ? cookie.value.trim() : undefined;
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export async function getCurrentSession(): Promise<AuthResponse | null> {
  const cookieStore = await cookies();
  const cookieHeader = stringifyCookies(cookieStore.getAll());

  if (!cookieHeader) {
    return null;
  }

  const session = await requestSession(cookieHeader);

  if (!session) {
    return null;
  }

  return buildAuthResponse(session);
}

type BetterAuthSession = {
  session: {
    token: string;
    expiresAt: string | Date;
  } & Record<string, unknown>;
  user: {
    id: string;
    email: string;
    name?: string | null;
  } & Record<string, unknown>;
} | null;

function stringifyCookies(
  allCookies: Array<{ name: string; value: string }>,
): string | null {
  if (allCookies.length === 0) {
    return null;
  }

  return allCookies.map(({ name, value }) => `${name}=${value}`).join("; ");
}

async function requestSession(
  cookieHeader: string,
): Promise<BetterAuthSession> {
  try {
    const headers = new Headers();
    headers.set("cookie", cookieHeader);

    return (await auth.api.getSession({
      headers,
      asResponse: false,
    })) as BetterAuthSession;
  } catch (error) {
    console.error("Failed to fetch current session", error);
    return null;
  }
}

function buildAuthResponse(
  session: NonNullable<BetterAuthSession>,
): AuthResponse {
  const expiresAtIso = normalizeExpiration(session.session.expiresAt);
  const maxAge = calculateMaxAgeSeconds(expiresAtIso);
  const userRecord = session.user as Record<string, unknown>;
  const sessionRecord = session.session as Record<string, unknown>;

  return {
    token: session.session.token,
    expiresAt: expiresAtIso,
    maxAge,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? session.user.email,
      role: typeof userRecord.role === "string" ? userRecord.role : "user",
      banned:
        typeof userRecord.banned === "boolean" ? userRecord.banned : false,
      banReason:
        typeof userRecord.banReason === "string" ? userRecord.banReason : null,
      banExpires: normalizeBanExpires(userRecord.banExpires),
    },
    impersonatedBy:
      typeof sessionRecord.impersonatedBy === "string"
        ? sessionRecord.impersonatedBy
        : null,
  };
}

function normalizeExpiration(value: string | Date): string {
  const base = typeof value === "string" ? value : value.toISOString();
  return new Date(base).toISOString();
}

function calculateMaxAgeSeconds(expiresAtIso: string): number {
  const diffMs = new Date(expiresAtIso).getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / 1000));
}

function normalizeBanExpires(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return typeof value === "string" ? value : null;
}
