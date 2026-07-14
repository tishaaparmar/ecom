import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

function resolveCorsOrigin(corsOrigin: string): boolean | string[] {
  if (corsOrigin === '*') {
    return true;
  }

  return corsOrigin.split(',').map((origin) => origin.trim());
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const corsOrigin = configService.getOrThrow<string>('CORS_ORIGIN');

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({
    origin: resolveCorsOrigin(corsOrigin),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('E-Commerce Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  const port = configService.getOrThrow<number>('PORT');

  await app.listen(port);

  logger.log(`Server running on http://localhost:${port}`);
}

void bootstrap();
