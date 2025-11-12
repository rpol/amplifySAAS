(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__0323fa5d._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/apps/web/src/lib/auth.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BETTER_AUTH_BASE_PATH",
    ()=>BETTER_AUTH_BASE_PATH,
    "BETTER_AUTH_BASE_URL",
    ()=>BETTER_AUTH_BASE_URL,
    "DEFAULT_AUTH_REDIRECT",
    ()=>DEFAULT_AUTH_REDIRECT,
    "resolveRedirectPath",
    ()=>resolveRedirectPath
]);
const DEFAULT_AUTH_REDIRECT = "/amplify/default";
const betterAuthBaseUrlInput = process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? process.env.BETTER_AUTH_API_URL ?? undefined;
const betterAuthBasePathInput = process.env.NEXT_PUBLIC_BETTER_AUTH_PATH ?? process.env.BETTER_AUTH_API_PATH ?? "/api/auth";
function toAbsoluteUrl(value) {
    if (!value) return undefined;
    try {
        return new URL(value).toString().replace(/\/+$/, "");
    } catch (error) {
        if ("TURBOPACK compile-time truthy", 1) {
            console.warn(`[better-auth] Ignoring invalid Better Auth base URL. Provide an absolute URL instead. Received: ${value}`, error);
        }
        return undefined;
    }
}
function normalizePath(pathValue) {
    const trimmed = pathValue.trim();
    if (!trimmed) return "/api/auth";
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
const BETTER_AUTH_BASE_URL = toAbsoluteUrl(betterAuthBaseUrlInput);
const BETTER_AUTH_BASE_PATH = normalizePath(betterAuthBasePathInput);
function resolveRedirectPath(path) {
    if (!path) return DEFAULT_AUTH_REDIRECT;
    if (!path.startsWith("/")) return DEFAULT_AUTH_REDIRECT;
    if (path.startsWith("//")) return DEFAULT_AUTH_REDIRECT;
    if (path.startsWith("/auth")) return DEFAULT_AUTH_REDIRECT;
    return path;
}
}),
"[project]/apps/web/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_babel-plugin-react-compiler@1.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_babel-plugin-react-compiler@1.0.0_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/auth.ts [middleware-edge] (ecmascript)");
;
;
const PUBLIC_PATHS = [
    "/auth",
    "/unauthorized"
];
const LOGIN_PATH = "/auth/v2/login";
async function middleware(request) {
    const { pathname } = request.nextUrl;
    const isAuthRoute = pathname.startsWith("/auth");
    const isPublic = isPublicPath(pathname);
    if (pathname.startsWith("/api")) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    const sessionState = await validateSession(request);
    if (!sessionState.valid) {
        return isPublic ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next() : redirectToLogin(request, sessionState.shouldClear);
    }
    if (isAuthRoute) {
        const redirectUrl = new URL(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["DEFAULT_AUTH_REDIRECT"], request.url);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
        response.headers.set("Cache-Control", "no-store");
        return response;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
async function validateSession(request) {
    const cookies = request.headers.get("cookie");
    if (!cookies) {
        return {
            valid: false,
            shouldClear: false
        };
    }
    const origin = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BETTER_AUTH_BASE_URL"] ?? request.nextUrl.origin;
    const path = `${__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["BETTER_AUTH_BASE_PATH"].replace(/\/$/, "")}/get-session`;
    const endpoint = new URL(path, origin);
    try {
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                cookie: cookies
            },
            cache: "no-store"
        });
        if (!response.ok) {
            const shouldClear = response.status === 401;
            return {
                valid: false,
                shouldClear
            };
        }
        const payload = await response.json().catch(()=>null);
        return {
            valid: Boolean(payload?.session?.token),
            shouldClear: false
        };
    } catch (error) {
        console.error("Failed to validate session", error);
        return {
            valid: false,
            shouldClear: false
        };
    }
}
function isPublicPath(pathname) {
    return PUBLIC_PATHS.some((path)=>pathname === path || pathname.startsWith(`${path}/`));
}
function redirectToLogin(request, shouldClearCookie = false) {
    const redirectUrl = new URL(LOGIN_PATH, request.url);
    const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    if (request.nextUrl.pathname && request.nextUrl.pathname !== LOGIN_PATH) {
        redirectUrl.searchParams.set("redirect", currentPath);
    }
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
    response.headers.set("Cache-Control", "no-store");
    if (shouldClearCookie) {
        for (const name of BETTER_AUTH_COOKIE_CANDIDATES){
            response.cookies.delete(name);
        }
    }
    return response;
}
const BETTER_AUTH_COOKIE_CANDIDATES = [
    "better-auth.session_token",
    "__Secure-better-auth.session_token",
    "better-auth.session_data",
    "__Secure-better-auth.session_data",
    "better-auth.dont_remember",
    "__Secure-better-auth.dont_remember"
];
const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|assets).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__0323fa5d._.js.map