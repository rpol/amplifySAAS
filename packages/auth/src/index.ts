import { betterAuth } from "better-auth";
import { prisma } from "@amplify/db";
import { prismaAdapter } from "better-auth/adapters/prisma";

const runtimeEnv =
  (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process?.env ?? {};

const debugAdapterLogs =
  runtimeEnv.BETTER_AUTH_DEBUG?.toLowerCase() === "true" ||
  runtimeEnv.NODE_ENV === "development";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    debugLogs: debugAdapterLogs,
  }),
});

export type AuthInstance = typeof auth;
