import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Chess Arena API')
    .setDescription('API for Chess Arena - a platform for chess bots')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('bots', 'Bot management endpoints')
    .addTag('matches', 'Match management endpoints')
    .addTag('admin', 'Administrative endpoints')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS for the frontend
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`Application running on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/api`);
  logger.log(`CORS enabled for: ${frontendUrl}`);
}
bootstrap();
