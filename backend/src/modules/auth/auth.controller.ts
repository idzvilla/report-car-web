import { Controller, Post, Body, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Вход через email/пароль' })
  async login(@Body() loginDto: any) {
    return { message: 'Login endpoint' };
  }

  @Get('telegram')
  @ApiOperation({ summary: 'OAuth callback от Telegram' })
  @ApiResponse({ status: 200, description: 'Успешная авторизация через Telegram' })
  @ApiResponse({ status: 400, description: 'Некорректные данные от Telegram' })
  async telegramAuth(
    @Query() query: any,
    @Res() res: Response
  ) {
    try {
      const { id, first_name, last_name, username, photo_url, auth_date, hash } = query;
      
      // Проверяем подпись данных от Telegram
      const isValid = await this.authService.verifyTelegramAuth(query);
      
      if (!isValid) {
        return res.status(400).send(`
          <html>
            <body>
              <h1>Ошибка авторизации</h1>
              <p>Неверная подпись данных от Telegram</p>
              <script>
                setTimeout(() => {
                  window.close();
                }, 3000);
              </script>
            </body>
          </html>
        `);
      }

      // Создаем или находим пользователя
      const user = await this.authService.createOrFindTelegramUser({
        telegramId: id,
        firstName: first_name,
        lastName: last_name,
        username: username,
        photoUrl: photo_url
      });

      // Генерируем JWT токен
      const token = await this.authService.generateJwtToken(user);

      // Перенаправляем на фронтенд с токеном
      return res.redirect(`http://localhost:4200/auth/telegram-success?token=${token}`);
      
    } catch (error) {
      console.error('Telegram auth error:', error);
      return res.status(500).send(`
        <html>
          <body>
            <h1>Ошибка сервера</h1>
            <p>Произошла ошибка при авторизации через Telegram</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 3000);
            </script>
          </body>
        </html>
      `);
    }
  }
}