"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = require("crypto");
const db_1 = require("@amplify/db");
const common_1 = require("@nestjs/common");
const bcryptjs_1 = require("bcryptjs");
const DEFAULT_SESSION_SECONDS = 60 * 60 * 24 * 7;
const REMEMBER_ME_SESSION_SECONDS = 60 * 60 * 24 * 30;
const AUTH_PROVIDER_ID = "email";
let AuthService = class AuthService {
    async register(dto) {
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException("Email is already registered");
        }
        const passwordHash = await (0, bcryptjs_1.hash)(dto.password, 12);
        const result = await db_1.prisma.$transaction(async (tx) => {
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
            const session = await this.createSession(tx, user.id, DEFAULT_SESSION_SECONDS);
            return { user, session };
        });
        return this.toAuthResponse(result.user, result.session);
    }
    async login(dto) {
        const account = await db_1.prisma.account.findUnique({
            where: {
                providerId_accountId: {
                    providerId: AUTH_PROVIDER_ID,
                    accountId: dto.email.toLowerCase(),
                },
            },
            include: { user: true },
        });
        if (!account || !account.password) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const passwordMatch = await (0, bcryptjs_1.compare)(dto.password, account.password);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        const maxAgeSeconds = dto.remember
            ? REMEMBER_ME_SESSION_SECONDS
            : DEFAULT_SESSION_SECONDS;
        const session = await db_1.prisma.$transaction(async (tx) => {
            await this.removeExpiredSessions(tx, account.userId);
            return this.createSession(tx, account.userId, maxAgeSeconds);
        });
        return this.toAuthResponse(account.user, session);
    }
    async validateSession(token) {
        const session = await db_1.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!session || this.isSessionExpired(session.expiresAt)) {
            if (session) {
                await db_1.prisma.session
                    .delete({ where: { id: session.id } })
                    .catch(() => undefined);
            }
            return null;
        }
        return this.toAuthResponse(session.user, session);
    }
    async logout(token) {
        await db_1.prisma.session.delete({ where: { token } }).catch(() => undefined);
    }
    deriveNameFromEmail(email) {
        const localPart = email.split("@")[0] ?? "";
        return (localPart
            .replace(/[._-]+/g, " ")
            .split(" ")
            .filter(Boolean)
            .map((segment) => segment[0].toUpperCase() + segment.slice(1))
            .join(" ")
            .trim() || "User");
    }
    async createSession(tx, userId, maxAgeSeconds) {
        const token = (0, crypto_1.randomBytes)(48).toString("hex");
        const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);
        await tx.session.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
        return { token, expiresAt, impersonatedBy: null };
    }
    async removeExpiredSessions(tx, userId) {
        await tx.session.deleteMany({
            where: {
                userId,
                expiresAt: { lt: new Date() },
            },
        });
    }
    isSessionExpired(expiresAt) {
        return expiresAt.getTime() <= Date.now();
    }
    toAuthResponse(user, session) {
        const maxAge = Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
        const userSummary = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            banned: user.banned,
            banReason: user.banReason,
            banExpires: user.banExpires?.toISOString() ?? null,
        };
        return {
            token: session.token,
            expiresAt: session.expiresAt.toISOString(),
            maxAge,
            user: userSummary,
            impersonatedBy: session.impersonatedBy ?? null,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
