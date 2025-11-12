import { NextResponse, type NextRequest } from "next/server";

import {
  BETTER_AUTH_BASE_PATH,
  BETTER_AUTH_BASE_URL,
  DEFAULT_AUTH_REDIRECT,
} from "@/lib/auth";

const PUBLIC_PATHS = ["/auth", "/unauthorized"];
const LOGIN_PATH = "/auth/v2/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/auth");
  const isPublic = isPublicPath(pathname);

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const sessionState = await validateSession(request);

  if (!sessionState.valid) {
    return isPublic
      ? NextResponse.next()
      : redirectToLogin(request, sessionState.shouldClear);
  }

  if (isAuthRoute) {
    const redirectUrl = new URL(DEFAULT_AUTH_REDIRECT, request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return NextResponse.next();
}

async function validateSession(
  request: NextRequest,
): Promise<{ valid: boolean; shouldClear: boolean }> {
  const cookies = request.headers.get("cookie");

  if (!cookies) {
    return { valid: false, shouldClear: false };
  }

  const origin = BETTER_AUTH_BASE_URL ?? request.nextUrl.origin;
  const path = `${BETTER_AUTH_BASE_PATH.replace(/\/$/, "")}/get-session`;
  const endpoint = new URL(path, origin);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        cookie: cookies,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const shouldClear = response.status === 401;
      return { valid: false, shouldClear };
    }

    const payload = (await response.json().catch(() => null)) as {
      session?: { token?: string } | null;
    } | null;

    return { valid: Boolean(payload?.session?.token), shouldClear: false };
  } catch (error) {
    console.error("Failed to validate session", error);
    return { valid: false, shouldClear: false };
  }
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function redirectToLogin(request: NextRequest, shouldClearCookie = false) {
  const redirectUrl = new URL(LOGIN_PATH, request.url);
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (request.nextUrl.pathname && request.nextUrl.pathname !== LOGIN_PATH) {
    redirectUrl.searchParams.set("redirect", currentPath);
  }

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set("Cache-Control", "no-store");

  if (shouldClearCookie) {
    for (const name of BETTER_AUTH_COOKIE_CANDIDATES) {
      response.cookies.delete(name);
    }
  }

  return response;
}

const BETTER_AUTH_COOKIE_CANDIDATES = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_data",
  "__Secure-better-auth.session_data",
  "better-auth.dont_remember",
  "__Secure-better-auth.dont_remember",
];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
