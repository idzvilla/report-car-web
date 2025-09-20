import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly telegramBotToken = process.env.TELEGRAM_BOT_TOKEN || 'your-bot-token';
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';

  constructor(private jwtService: JwtService) {}

  // Заглушка для тестирования
  async validateUser(email: string, password: string): Promise<any> {
    return { id: '1', email, fullName: 'Test User' };
  }

  /**
   * Проверяет подпись данных от Telegram
   */
  async verifyTelegramAuth(query: any): Promise<boolean> {
    try {
      const { hash, ...data } = query;
      
      // Создаем строку для проверки подписи
      const dataCheckString = Object.keys(data)
        .sort()
        .map(key => `${key}=${data[key]}`)
        .join('\n');

      // Создаем секретный ключ из токена бота
      const secretKey = createHmac('sha256', 'WebAppData')
        .update(this.telegramBotToken)
        .digest();

      // Вычисляем подпись
      const calculatedHash = createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      return calculatedHash === hash;
    } catch (error) {
      console.error('Error verifying Telegram auth:', error);
      return false;
    }
  }

  /**
   * Создает или находит пользователя по данным Telegram
   */
  async createOrFindTelegramUser(telegramData: {
    telegramId: string;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
  }): Promise<any> {
    // В реальном приложении здесь бы была работа с базой данных
    // Пока возвращаем заглушку
    return {
      id: `tg_${telegramData.telegramId}`,
      telegramId: telegramData.telegramId,
      firstName: telegramData.firstName,
      lastName: telegramData.lastName,
      username: telegramData.username,
      photoUrl: telegramData.photoUrl,
      email: null, // У Telegram нет email
      fullName: `${telegramData.firstName} ${telegramData.lastName || ''}`.trim(),
      authProvider: 'telegram'
    };
  }

  /**
   * Генерирует JWT токен для пользователя
   */
  async generateJwtToken(user: any): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      authProvider: user.authProvider,
      telegramId: user.telegramId
    };

    return this.jwtService.sign(payload, {
      secret: this.jwtSecret,
      expiresIn: '7d'
    });
  }
}