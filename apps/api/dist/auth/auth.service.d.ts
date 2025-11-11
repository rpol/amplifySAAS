import { LoginDto, RegisterDto, type AuthResponse } from "@amplify/types";
export declare class AuthService {
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    validateSession(token: string): Promise<AuthResponse | null>;
    logout(token: string): Promise<void>;
    private deriveNameFromEmail;
    private createSession;
    private removeExpiredSessions;
    private isSessionExpired;
    private toAuthResponse;
}
//# sourceMappingURL=auth.service.d.ts.map