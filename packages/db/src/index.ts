import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  process?: { env?: Record<string, string | undefined> };
};

const runtimeEnv = globalForPrisma.process?.env ?? {};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      runtimeEnv.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (runtimeEnv.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
