import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  // Заглушка для тестирования
  async getStats() {
    return { totalReports: 0, totalUsers: 0 };
  }
}