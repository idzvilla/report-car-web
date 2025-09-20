import { Controller, Post, Get, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequestReportDto } from './dto/request-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Отчёты')
@Controller('v1/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Запрос отчёта по VIN' })
  @ApiResponse({ status: 201, description: 'Запрос отчёта создан' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  async requestReport(@Body() requestReportDto: RequestReportDto) {
    return this.reportsService.requestReport('test-user-id', requestReportDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение информации об отчёте' })
  @ApiResponse({ status: 200, description: 'Информация об отчёте' })
  @ApiResponse({ status: 404, description: 'Отчёт не найден' })
  @ApiResponse({ status: 403, description: 'Нет доступа к отчёту' })
  async getReport(@Param('id') id: string) {
    return this.reportsService.getReport(id, 'test-user-id');
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Скачивание отчёта' })
  @ApiResponse({ status: 200, description: 'URL для скачивания' })
  @ApiResponse({ status: 404, description: 'PDF файл не найден' })
  @ApiResponse({ status: 403, description: 'Нет доступа к отчёту' })
  async downloadReport(@Param('id') id: string) {
    return this.reportsService.downloadReport(id, 'test-user-id');
  }

  @Get()
  @ApiOperation({ summary: 'Получение списка отчётов пользователя' })
  @ApiResponse({ status: 200, description: 'Список отчётов' })
  async getUserReports() {
    return this.reportsService.getUserReports('test-user-id');
  }
}
