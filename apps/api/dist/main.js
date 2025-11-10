"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const rawOrigins = process.env.WEB_APP_ORIGINS ?? "http://localhost:3000";
    const originList = rawOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    app.enableCors({
        origin: originList.length > 0 ? originList : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = Number(process.env.PORT ?? 3001);
    await app.listen(port);
    console.log(`API server is running at http://localhost:${port}`);
}
void bootstrap();
