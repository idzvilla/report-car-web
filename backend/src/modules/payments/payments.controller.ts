import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  @Post('create')
  async createPayment(@Body() data: any) {
    return { message: 'Payment endpoint' };
  }
}