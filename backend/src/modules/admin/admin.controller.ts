import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @Get('stats')
  async getStats() {
    return { message: 'Admin stats endpoint' };
  }
}