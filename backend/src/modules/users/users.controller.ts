import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get('profile')
  async getProfile() {
    return { message: 'Profile endpoint' };
  }
}