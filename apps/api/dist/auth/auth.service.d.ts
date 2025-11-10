import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import type { AuthResponse } from "./dto/auth-response.dto";
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