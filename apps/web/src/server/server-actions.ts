"use server";

import { cookies } from "next/headers";

import { type AuthResponse } from "@amplify/types";

import { AUTH_API_BASE_URL, SESSION_COOKIE_NAME } from "@/lib/auth";

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
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 401) {
        cookieStore.delete(SESSION_COOKIE_NAME);
      }
      return null;
    }

    return (await response.json()) as AuthResponse;
  } catch (error) {
    console.error("Failed to fetch current session", error);
    return null;
  }
}

export async function logout(): Promise<
  { success: true } | { success: false; error: string }
> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true };
  }

  try {
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 401) {
      return {
        success: false,
        error: "Failed to log out. Please try again.",
      };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected logout failure.";
    return {
      success: false,
      error: message,
    };
  } finally {
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  return { success: true };
}
