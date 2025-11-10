import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const rawOrigins = process.env.WEB_APP_ORIGINS ?? "http://localhost:3000";
  const originList = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: originList.length > 0 ? originList : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const port = Number(process.env.PORT ?? 3001);

  await app.listen(port);
  console.log(`API server is running at http://localhost:${port}`);
}

void bootstrap();
