import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats() {
    return await this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers() {
    return await this.adminService.getAllUsers();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all reports' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getReports() {
    return await this.adminService.getAllReports();
  }

  @Put('users/:id/credits')
  @ApiOperation({ summary: 'Update user credits' })
  @ApiResponse({ status: 200, description: 'User credits updated successfully' })
  async updateUserCredits(
    @Param('id') userId: string,
    @Body('credits') credits: number
  ) {
    return await this.adminService.updateUserCredits(userId, credits);
  }
}