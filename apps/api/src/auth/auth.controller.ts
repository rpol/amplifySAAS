import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import type { AuthResponse } from "./dto/auth-response.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get("session")
  async session(
    @Headers("authorization") authorization?: string
  ): Promise<AuthResponse> {
    const token = this.extractToken(authorization);

    if (!token) {
      throw new UnauthorizedException("Missing session token");
    }

    const session = await this.authService.validateSession(token);

    if (!session) {
      throw new UnauthorizedException("Invalid session token");
    }

    return session;
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Headers("authorization") authorization?: string) {
    const token = this.extractToken(authorization);

    if (!token) {
      throw new UnauthorizedException("Missing session token");
    }

    await this.authService.logout(token);
  }

  private extractToken(authorization?: string): string | undefined {
    if (!authorization) return undefined;
    const [schema, token] = authorization.split(" ");
    if (!schema || schema.toLowerCase() !== "bearer" || !token)
      return undefined;
    return token;
  }
}
