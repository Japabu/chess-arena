import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<INestApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Set global prefix for API routes
  app.setGlobalPrefix('api', {
    exclude: ['*'], // Exclude the AppController catch-all route
  });

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
  logger.log(`API available at /api`);
  logger.log(`CORS enabled for: ${frontendUrl}`);
  logger.log(`Static files served via ServeStaticModule`);
}
bootstrap();
