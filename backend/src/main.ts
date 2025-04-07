import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Enable CORS for the frontend
  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);

  logger.log(`Application running on port ${port}`);
  logger.log(`CORS enabled for: ${frontendUrl}`);
}
bootstrap();
