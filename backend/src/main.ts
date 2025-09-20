import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  });

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
