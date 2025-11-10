import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes } from "crypto";
import { compare, hash } from "bcryptjs";

import { Prisma, prisma, type User } from "@amplify/db";

import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import type { AuthResponse } from "./dto/auth-response.dto";

const DEFAULT_SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30; // 30 days
const AUTH_PROVIDER_ID = "email";

type PrismaClientLike = Prisma.TransactionClient | typeof prisma;

@Injectable()
export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await hash(dto.password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          name: this.deriveNameFromEmail(dto.email),
        },
      });

      await tx.account.create({
        data: {
          providerId: AUTH_PROVIDER_ID,
          accountId: dto.email.toLowerCase(),
          userId: user.id,
          password: passwordHash,
        },
      });

      await this.removeExpiredSessions(tx, user.id);

      const session = await this.createSession(
        tx,
        user.id,
        DEFAULT_SESSION_SECONDS
      );

      return { user, session };
    });

    return this.toAuthResponse(result.user, result.session);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const account = await prisma.account.findUnique({
      where: {
        providerId_accountId: {
          providerId: AUTH_PROVIDER_ID,
          accountId: dto.email.toLowerCase(),
        },
      },
      include: { user: true },
    });

    if (!account || !account.password) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordMatch = await compare(dto.password, account.password);

    if (!passwordMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const maxAgeSeconds = dto.remember
      ? REMEMBER_ME_SESSION_SECONDS
      : DEFAULT_SESSION_SECONDS;

    const session = await prisma.$transaction(async (tx) => {
      await this.removeExpiredSessions(tx, account.userId);
      return this.createSession(tx, account.userId, maxAgeSeconds);
    });

    return this.toAuthResponse(account.user, session);
  }

  async validateSession(token: string): Promise<AuthResponse | null> {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || this.isSessionExpired(session.expiresAt)) {
      if (session) {
        await prisma.session
          .delete({ where: { id: session.id } })
          .catch(() => undefined);
      }
      return null;
    }

    return this.toAuthResponse(session.user, session);
  }

  async logout(token: string): Promise<void> {
    await prisma.session.delete({ where: { token } }).catch(() => undefined);
  }

  private deriveNameFromEmail(email: string): string {
    const localPart = email.split("@")[0] ?? "";
    return (
      localPart
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((segment) => segment[0].toUpperCase() + segment.slice(1))
        .join(" ")
        .trim() || "User"
    );
  }

  private async createSession(
    tx: PrismaClientLike,
    userId: string,
    maxAgeSeconds: number
  ) {
    const token = randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

    await tx.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  private async removeExpiredSessions(tx: PrismaClientLike, userId: string) {
    await tx.session.deleteMany({
      where: {
        userId,
        expiresAt: { lt: new Date() },
      },
    });
  }

  private isSessionExpired(expiresAt: Date): boolean {
    return expiresAt.getTime() <= Date.now();
  }

  private toAuthResponse(
    user: User,
    session: { token: string; expiresAt: Date }
  ): AuthResponse {
    const maxAge = Math.max(
      0,
      Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
    );

    return {
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      maxAge,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
