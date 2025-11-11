import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, type AuthResponse } from "@amplify/types";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    session(authorization?: string): Promise<AuthResponse>;
    logout(authorization?: string): Promise<void>;
    private extractToken;
}
//# sourceMappingURL=auth.controller.d.ts.map