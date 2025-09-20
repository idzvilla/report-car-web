import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  // Заглушка для тестирования
  async createPayment(data: any) {
    return { id: 'payment-123', status: 'pending' };
  }
}