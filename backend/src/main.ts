import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Глобальный префикс для API
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  });

  // Обслуживание статических файлов фронтенда в продакшене
  if (process.env.NODE_ENV === 'production') {
    app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'dist', 'carfax-frontend'));
    app.setBaseViewsDir(join(__dirname, '..', '..', 'frontend', 'dist', 'carfax-frontend'));
    app.setViewEngine('html');
  }

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('CarFax Web API')
    .setDescription('API для сервиса отчётов по VIN номерам')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступно по адресу: http://localhost:${PORT}/api`);
  console.log(`📚 Swagger документация: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
}

bootstrap().catch(console.error);
