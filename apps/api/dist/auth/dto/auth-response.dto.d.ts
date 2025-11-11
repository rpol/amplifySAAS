import type { User } from "@amplify/db";
export interface AuthResponse {
    token: string;
    expiresAt: string;
    maxAge: number;
    user: Pick<User, "id" | "email" | "name">;
}
//# sourceMappingURL=auth-response.dto.d.ts.map