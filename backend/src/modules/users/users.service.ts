import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  // Заглушка для тестирования
  async getUserProfile(userId: string) {
    return { id: userId, email: 'test@example.com', fullName: 'Test User' };
  }
}