"use client";

import { createAuthClient } from "better-auth/client";
import { organizationClient } from "better-auth/client/plugins";

import { BETTER_AUTH_BASE_PATH, BETTER_AUTH_BASE_URL } from "./auth";

export const authClient = createAuthClient({
  ...(BETTER_AUTH_BASE_URL ? { baseURL: BETTER_AUTH_BASE_URL } : {}),
  basePath: BETTER_AUTH_BASE_PATH,
  plugins: [organizationClient()],
});
