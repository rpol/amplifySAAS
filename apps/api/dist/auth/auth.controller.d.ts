import { AuthService } from "./auth.service";
import type { AuthResponse } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
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