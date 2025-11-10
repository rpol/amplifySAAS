import { NextResponse, type NextRequest } from "next/server";

import {
  AUTH_API_BASE_URL,
  DEFAULT_AUTH_REDIRECT,
  SESSION_COOKIE_NAME,
  type AuthResponse,
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

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return isPublic ? NextResponse.next() : redirectToLogin(request);
  }

  const session = await validateSession(sessionToken);

  if (!session) {
    return isPublic ? NextResponse.next() : redirectToLogin(request, true);
  }

  if (isAuthRoute) {
    const redirectUrl = new URL(DEFAULT_AUTH_REDIRECT, request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return NextResponse.next();
}

async function validateSession(token: string): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${AUTH_API_BASE_URL}/auth/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthResponse;
  } catch (error) {
    console.error("Failed to validate session", error);
    return null;
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
    response.cookies.delete(SESSION_COOKIE_NAME);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
