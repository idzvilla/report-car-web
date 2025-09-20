import { createClient } from '@supabase/supabase-js';
import { PDFGenerator } from './pdf-generator';
import { ReportProcessor } from './report-processor';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

class PDFWorker {
  private supabase;
  private pdfGenerator: PDFGenerator;
  private reportProcessor: ReportProcessor;
  private isRunning = false;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    this.pdfGenerator = new PDFGenerator(this.supabase);
    this.reportProcessor = new ReportProcessor(this.supabase);
  }

  async start() {
    console.log('🚀 PDF Worker запущен');
    this.isRunning = true;

    // Обрабатываем отчёты каждые 30 секунд
    setInterval(async () => {
      if (this.isRunning) {
        await this.processPendingReports();
      }
    }, 30000);

    // Обрабатываем сразу при запуске
    await this.processPendingReports();
  }

  async stop() {
    console.log('🛑 PDF Worker остановлен');
    this.isRunning = false;
  }

  private async processPendingReports() {
    try {
      // Получаем отчёты со статусом 'pending'
      const { data: reports, error } = await this.supabase
        .from('reports')
        .select('*')
        .eq('status', 'pending')
        .limit(10);

      if (error) {
        console.error('Ошибка получения отчётов:', error);
        return;
      }

      if (!reports || reports.length === 0) {
        console.log('📋 Нет отчётов для обработки');
        return;
      }

      console.log(`📋 Найдено ${reports.length} отчётов для обработки`);

      // Обрабатываем каждый отчёт
      for (const report of reports) {
        await this.processReport(report);
      }
    } catch (error) {
      console.error('Ошибка обработки отчётов:', error);
    }
  }

  private async processReport(report: any) {
    try {
      console.log(`🔄 Обработка отчёта ${report.id} для VIN ${report.vin}`);

      // Обновляем статус на 'generating'
      await this.supabase
        .from('reports')
        .update({ status: 'generating' })
        .eq('id', report.id);

      // Генерируем PDF
      const pdfFileName = await this.pdfGenerator.generateVinReport({
        vin: report.vin,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        color: 'Silver',
        mileage: 45000,
        accidents: 0,
        owners: 1,
        serviceHistory: [
          'Oil change - 10,000 miles',
          'Brake inspection - 25,000 miles',
          'Tire rotation - 35,000 miles',
        ],
        recalls: [],
        marketValue: 25000,
        generatedAt: new Date(),
      });

      // Обновляем отчёт с именем PDF файла
      const { error: updateError } = await this.supabase
        .from('reports')
        .update({
          status: 'completed',
          pdf_file_name: pdfFileName,
          generated_at: new Date().toISOString(),
        })
        .eq('id', report.id);

      if (updateError) {
        throw new Error(`Ошибка обновления отчёта: ${updateError.message}`);
      }

      console.log(`✅ Отчёт ${report.id} успешно обработан`);

      // Проверяем, нужно ли использовать credit
      await this.reportProcessor.handleCompletedReport(report.id, report.user_id);

    } catch (error) {
      console.error(`❌ Ошибка обработки отчёта ${report.id}:`, error);

      // Обновляем статус на 'error'
      await this.supabase
        .from('reports')
        .update({ status: 'error' })
        .eq('id', report.id);
    }
  }
}

// Обработка сигналов завершения
process.on('SIGINT', async () => {
  console.log('\n🛑 Получен сигнал SIGINT');
  await worker.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Получен сигнал SIGTERM');
  await worker.stop();
  process.exit(0);
});

// Запуск worker
const worker = new PDFWorker();
worker.start().catch(console.error);
