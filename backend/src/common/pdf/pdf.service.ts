import { Injectable } from '@nestjs/common';

export interface VinReportData {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  accidents: number;
  owners: number;
  serviceHistory: string[];
  recalls: string[];
  marketValue: number;
  generatedAt: Date;
}

@Injectable()
export class PdfService {
  // Заглушка для тестирования
  async generateVinReport(data: VinReportData): Promise<string> {
    return 'report-' + Date.now() + '.pdf';
  }

  async getSignedUrl(fileName: string): Promise<string> {
    return 'https://example.com/' + fileName;
  }
}