import { config as loadEnv } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const runtimeEnv = process.env;

if (!runtimeEnv.DATABASE_URL) {
  const findEnvFrom = (startDir: string): string | undefined => {
    let current = startDir;
    for (let depth = 0; depth < 8; depth += 1) {
      const candidate = resolve(current, ".env");
      if (existsSync(candidate)) return candidate;
      const parent = dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return undefined;
  };

  const envCandidates = [findEnvFrom(process.cwd())].filter(
    (value): value is string => Boolean(value)
  );

  const tried = new Set<string>();
  for (const candidate of envCandidates) {
    if (tried.has(candidate)) continue;
    tried.add(candidate);
    if (!existsSync(candidate)) continue;
    loadEnv({ path: candidate });
    if (process.env.DATABASE_URL) break;
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

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
