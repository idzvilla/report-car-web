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
    const publicPath = join(__dirname, '..', 'public');
    app.useStaticAssets(publicPath);
    app.setBaseViewsDir(publicPath);
    app.setViewEngine('html');
    
    // Обработка всех маршрутов, не начинающихся с /api
    app.getHttpAdapter().get('*', (req: any, res: any, next: any) => {
      if (req.url.startsWith('/api')) {
        return next();
      }
      res.sendFile(join(publicPath, 'index.html'));
    });
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
  await app.listen(PORT, '0.0.0.0'); // Важно для Railway
  
  const isProd = process.env.NODE_ENV === 'production';
  const baseUrl = isProd ? 'Railway App' : `http://localhost:${PORT}`;
  
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 API доступно по адресу: ${baseUrl}/api`);
  console.log(`📚 Swagger документация: ${baseUrl}/api/docs`);
  console.log(`🏥 Health check: ${baseUrl}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap().catch(console.error);
