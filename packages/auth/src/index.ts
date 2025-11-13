import { betterAuth } from "better-auth";
import { prisma } from "@amplify/db";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, organization } from "better-auth/plugins";

const runtimeEnv =
  (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? {};

const DEFAULT_BETTER_AUTH_PATH = "/api/auth";

function resolveBasePath(value?: string): string {
  if (!value) return DEFAULT_BETTER_AUTH_PATH;
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_BETTER_AUTH_PATH;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function resolveBaseUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).toString().replace(/\/+$/g, "");
  } catch (error) {
    if (runtimeEnv.NODE_ENV !== "production") {
      console.warn(
        `[better-auth] Ignoring invalid BETTER_AUTH_URL. Provide an absolute URL instead. Received: ${value}`
      );
    }
    return undefined;
  }
}

const betterAuthBaseUrlInput =
  runtimeEnv.BETTER_AUTH_URL ??
  runtimeEnv.BETTER_AUTH_API_URL ??
  runtimeEnv.NEXT_PUBLIC_BETTER_AUTH_URL ??
  runtimeEnv.PUBLIC_BETTER_AUTH_URL ??
  undefined;

const betterAuthBasePathInput =
  runtimeEnv.BETTER_AUTH_PATH ??
  runtimeEnv.BETTER_AUTH_API_PATH ??
  runtimeEnv.NEXT_PUBLIC_BETTER_AUTH_PATH ??
  DEFAULT_BETTER_AUTH_PATH;

const betterAuthBaseURL = resolveBaseUrl(betterAuthBaseUrlInput);
const betterAuthBasePath = resolveBasePath(betterAuthBasePathInput);

const debugAdapterLogs =
  runtimeEnv.BETTER_AUTH_DEBUG?.toLowerCase() === "true" ||
  runtimeEnv.NODE_ENV === "development";

export const auth = betterAuth({
  ...(betterAuthBaseURL ? { baseURL: betterAuthBaseURL } : {}),
  basePath: betterAuthBasePath,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    debugLogs: debugAdapterLogs,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization(),
    admin({
      adminRoles: ["admin", "owner"],
    }),
  ],
});

export type AuthInstance = typeof auth;
