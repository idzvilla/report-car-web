import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportsService, Report } from '../../services/reports.service';
import { VinInputComponent } from '../../components/vin-input/vin-input.component';
import { PaywallModalComponent } from '../../components/paywall-modal/paywall-modal.component';
import { ReportCardComponent } from '../../components/report-card/report-card.component';

@Component({
  selector: 'app-home',
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Hero Section -->
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold text-gray-900 mb-6">
            Отчёты CarFax по VIN
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Подлинные отчёты CarFax с полной историей автомобиля, авариями, сервисными работами и многое другое. 
            Официальные данные за считанные минуты.
          </p>
        </div>

        <!-- VIN Input Card -->
        <div class="max-w-2xl mx-auto mb-16">
          <div class="card">
            <div class="card-body">
              <app-vin-input 
                (vinSubmitted)="onVinSubmitted($event)"
                #vinInput
              ></app-vin-input>
            </div>
          </div>
        </div>


            <!-- User Reports Section -->
            <div *ngIf="userReports.length > 0" class="max-w-2xl mx-auto mb-16">
              <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-gray-900">Ваши отчёты</h2>
                <span class="text-sm text-gray-500">{{ userReports.length }} отчётов</span>
              </div>
              <div class="grid gap-4">
                <app-report-card 
                  *ngFor="let report of userReports"
                  [report]="report"
                  (download)="onDownloadReport($event)"
                  (retry)="onRetryReport($event)"
                ></app-report-card>
              </div>
            </div>

        <!-- Paywall Modal -->
        <app-paywall-modal
          [isVisible]="showPaywall"
          [vin]="currentVin"
          [reportId]="currentReportId"
          (close)="onClosePaywall()"
          (paymentSuccess)="onPaymentSuccess()"
        ></app-paywall-modal>
      </div>
    </div>
  `,
  styles: []
})
export class HomeComponent implements OnInit {
  @ViewChild('vinInput') vinInputComponent!: VinInputComponent;
  
  userReports: Report[] = [];
  showPaywall = false;
  currentVin = '';
  currentReportId = '';

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadUserReports();
  }

  onVinSubmitted(vin: string): void {
    this.currentVin = vin;
    this.reportsService.requestReport(vin).subscribe({
      next: (response) => {
        console.log('Response received:', response);
        // Для демонстрации всегда показываем paywall
        this.currentReportId = response.reportId;
        this.showPaywall = true;
        // Сбрасываем состояние загрузки
        this.resetVinInput();
      },
      error: (error) => {
        console.error('Ошибка запроса отчёта:', error);
        alert('Ошибка при запросе отчёта. Попробуйте снова.');
        // Сбрасываем состояние загрузки при ошибке
        this.resetVinInput();
      }
    });
  }

  onDownloadReport(reportId: string): void {
    this.reportsService.downloadReport(reportId).subscribe({
      next: (response) => {
        window.open(response.downloadUrl, '_blank');
      },
      error: (error) => {
        console.error('Ошибка скачивания:', error);
        alert('Ошибка при скачивании отчёта.');
      }
    });
  }

  onRetryReport(reportId: string): void {
    // В реальном приложении здесь бы был запрос на повторную генерацию
    console.log('Retry report:', reportId);
    this.loadUserReports();
  }

  onClosePaywall(): void {
    this.showPaywall = false;
    this.currentVin = '';
    this.currentReportId = '';
  }

  onPaymentSuccess(): void {
    // Показываем успешное сообщение
    alert('Оплата прошла успешно! Отчёт готов к скачиванию.');
    
    // Добавляем тестовый отчёт в список
    const testReport = {
      id: this.currentReportId,
      vin: this.currentVin,
      user_id: 'test-user',
      status: 'completed' as const,
      price: 2.00,
      pdf_file_name: `report_${this.currentReportId}.pdf`,
      generated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      downloadUrl: 'https://example.com/report.pdf'
    };
    
    this.userReports.unshift(testReport);
    this.loadUserReports();
  }

  private loadUserReports(): void {
    this.reportsService.getUserReports().subscribe({
      next: (reports) => {
        this.userReports = reports;
      },
      error: (error) => {
        console.error('Ошибка загрузки отчётов:', error);
      }
    });
  }

  private resetVinInput(): void {
    if (this.vinInputComponent) {
      this.vinInputComponent.resetForm();
    }
  }
}
