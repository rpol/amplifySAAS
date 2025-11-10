"use server";

import { cookies } from "next/headers";

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
