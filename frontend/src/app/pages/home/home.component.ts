import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportsService, Report } from '../../services/reports.service';
import { VinInputComponent } from '../../components/vin-input/vin-input.component';
import { BalanceModalComponent } from '../../components/balance-modal/balance-modal.component';
import { ReportCardComponent } from '../../components/report-card/report-card.component';
import { ToastService } from '../../services/toast.service';
import { AuthService, User } from '../../services/auth.service';

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
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Ваши отчёты ({{ getCompletedReportsCount() }})</h2>
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

        <!-- Balance Modal for VIN reports -->
        <app-balance-modal
          [isVisible]="showPaywall"
          (close)="onClosePaywall()"
          (paymentSuccess)="onPaymentSuccess($event)"
        ></app-balance-modal>

        <!-- Login Modal -->
        <app-login-modal
          [isVisible]="showLoginModal"
          (close)="showLoginModal = false"
          (loginSuccess)="onLoginSuccess()"
          (switchToRegister)="onSwitchToRegister()"
        ></app-login-modal>

        <!-- Register Modal -->
        <app-register-modal
          [isVisible]="showRegisterModal"
          (close)="showRegisterModal = false"
          (registerSuccess)="onRegisterSuccess()"
          (switchToLogin)="onSwitchToLogin()"
        ></app-register-modal>
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
  showLoginModal = false;
  showRegisterModal = false;
  currentUser: User | null = null;
  reportQueue: { vin: string, reportId: string }[] = [];
  isGenerating = false;

  constructor(
    private reportsService: ReportsService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserReports();
    
    // Подписываемся на изменения пользователя
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  onVinSubmitted(vin: string): void {
    this.currentVin = vin;
    
    // Сначала проверяем авторизацию
    if (!this.currentUser) {
      // Если не авторизован, показываем форму входа
      this.showLoginModal = true;
      return;
    }
    
    // Если авторизован, проверяем баланс
    this.checkBalanceAndGenerate(vin);
  }

  checkBalanceAndGenerate(vin: string): void {
    const userCredits = this.currentUser?.credits?.credits_remaining || 0;
    
    if (userCredits > 0) {
      // Если есть кредиты, генерируем отчет сразу
      this.generateReportWithCredits(vin);
    } else {
      // Если нет кредитов, показываем paywall
      this.reportsService.requestReport(vin).subscribe({
        next: (response) => {
          console.log('Response received:', response);
          this.currentReportId = response.reportId;
          this.showPaywall = true;
          this.resetVinInput();
        },
        error: (error) => {
          console.error('Ошибка запроса отчёта:', error);
          let errorMessage = 'Ошибка при запросе отчёта. Попробуйте снова.';
          
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          this.toastService.showError('Ошибка запроса отчёта', errorMessage);
          // Сбрасываем состояние загрузки при ошибке
          this.resetVinInput();
        }
      });
    }
  }

  generateReportWithCredits(vin: string): void {
    // Проверяем, есть ли уже генерирующийся отчет
    if (this.isGenerating) {
      // Если есть генерирующийся отчет, добавляем в очередь
      this.addToQueue(vin);
      return;
    }
    
    // Генерируем отчет используя кредиты пользователя
    this.startReportGeneration(vin);
  }

  addToQueue(vin: string): void {
    // Создаем отчет со статусом "pending" (в очереди)
    const queuedReport: Report = {
      id: `queue-${Date.now()}`,
      vin: vin,
      user_id: this.currentUser?.id || 'test-user',
      status: 'pending',
      price: 0,
      pdf_file_name: `report_queue_${Date.now()}.pdf`,
      generated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      downloadUrl: ''
    };
    
    // Добавляем в очередь
    this.reportQueue.push({ vin, reportId: queuedReport.id });
    this.userReports.unshift(queuedReport);
    
    // Уменьшаем количество кредитов у пользователя
    if (this.currentUser) {
      const updatedUser = {
        ...this.currentUser,
        credits: {
          credits_total: this.currentUser.credits?.credits_total || 0,
          credits_remaining: (this.currentUser.credits?.credits_remaining || 1) - 1
        }
      };
      this.authService.setCurrentUser(updatedUser);
    }
    
    // Показываем сообщение о добавлении в очередь
    this.toastService.showSuccess(
      'Отчёт добавлен в очередь!',
      'Отчёт будет сгенерирован после завершения текущего'
    );
    
    // Сбрасываем состояние загрузки
    this.resetVinInput();
  }

  startReportGeneration(vin: string, isFromQueue: boolean = false): void {
    this.isGenerating = true;
    
    this.reportsService.requestReport(vin).subscribe({
      next: (response) => {
        console.log('Report generated with credits:', response);
        
        if (!isFromQueue) {
          // Создаем новый отчет только если это не из очереди
          const testReport: Report = {
            id: response.reportId,
            vin: vin,
            user_id: this.currentUser?.id || 'test-user',
            status: 'generating',
            price: 0, // Бесплатно, так как использовали кредит
            pdf_file_name: `report_${response.reportId}.pdf`,
            generated_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            downloadUrl: 'https://example.com/report.pdf'
          };
          
          // Добавляем отчет в список
          this.userReports.unshift(testReport);
          
          // Уменьшаем количество кредитов у пользователя
          if (this.currentUser) {
            const updatedUser = {
              ...this.currentUser,
              credits: {
                credits_total: this.currentUser.credits?.credits_total || 0,
                credits_remaining: (this.currentUser.credits?.credits_remaining || 1) - 1
              }
            };
            this.authService.setCurrentUser(updatedUser);
          }
        }
        
    // Убираем toast - слишком много уведомлений
        
        // Запускаем таймер для завершения генерации (7 секунд для демонстрации)
        const generationTime = 7 * 1000; // 7 секунд
        
        setTimeout(() => {
          this.completeReportGeneration(response.reportId);
        }, generationTime);
        
        // Сбрасываем состояние загрузки только если это не из очереди
        if (!isFromQueue) {
          this.resetVinInput();
        }
      },
      error: (error) => {
        console.error('Ошибка генерации отчёта:', error);
        let errorMessage = 'Ошибка при генерации отчёта. Попробуйте снова.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.toastService.showError('Ошибка генерации отчёта', errorMessage);
        this.resetVinInput();
      }
    });
  }

  completeReportGeneration(reportId: string): void {
    // Находим отчет в списке и обновляем его статус
    const reportIndex = this.userReports.findIndex(report => report.id === reportId);
    if (reportIndex !== -1) {
      this.userReports[reportIndex] = {
        ...this.userReports[reportIndex],
        status: 'completed',
        generated_at: new Date().toISOString(),
        downloadUrl: 'https://example.com/report.pdf'
      };
      
      // Показываем уведомление о готовности отчета
      this.toastService.showSuccess(
        'Отчёт готов!',
        'Отчёт успешно сгенерирован и готов к скачиванию'
      );
    } else {
      // Если не нашли по ID, ищем последний генерирующийся отчет
      const generatingIndex = this.userReports.findIndex(report => report.status === 'generating');
      if (generatingIndex !== -1) {
        this.userReports[generatingIndex] = {
          ...this.userReports[generatingIndex],
          status: 'completed',
          generated_at: new Date().toISOString(),
          downloadUrl: 'https://example.com/report.pdf'
        };
        
        this.toastService.showSuccess(
          'Отчёт готов!',
          'Отчёт успешно сгенерирован и готов к скачиванию'
        );
      }
    }
    
    // Завершаем текущую генерацию
    this.isGenerating = false;
    
    // Проверяем очередь и запускаем следующий отчет
    this.processQueue();
  }

  processQueue(): void {
    if (this.reportQueue.length > 0 && !this.isGenerating) {
      const nextReport = this.reportQueue.shift(); // Берем первый отчет из очереди
      if (nextReport) {
        // Обновляем статус отчета с "pending" на "generating"
        const reportIndex = this.userReports.findIndex(report => report.id === nextReport.reportId);
        if (reportIndex !== -1) {
          this.userReports[reportIndex] = {
            ...this.userReports[reportIndex],
            status: 'generating',
            id: `generating-${Date.now()}` // Обновляем ID для генерации
          };
        }
        
        // Запускаем генерацию следующего отчета из очереди
        this.startReportGeneration(nextReport.vin, true);
      }
    }
  }

  onDownloadReport(reportId: string): void {
    this.reportsService.downloadReport(reportId).subscribe({
      next: (response) => {
        window.open(response.downloadUrl, '_blank');
      },
      error: (error) => {
        console.error('Ошибка скачивания:', error);
        this.toastService.showError('Ошибка скачивания', 'Ошибка при скачивании отчёта.');
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

  onPaymentSuccess(paymentData: { credits: number, plan: string }): void {
    // Обновляем баланс пользователя
    if (this.currentUser) {
      const updatedUser = {
        ...this.currentUser,
        credits: {
          credits_total: (this.currentUser.credits?.credits_total || 0) + paymentData.credits,
          credits_remaining: (this.currentUser.credits?.credits_remaining || 0) + paymentData.credits
        }
      };
      this.authService.setCurrentUser(updatedUser);
    }
    
    // Показываем сообщение о пополнении баланса
    this.toastService.showSuccess(
      'Баланс пополнен!',
      this.getAddedReportsText(paymentData.credits)
    );
    
    // Закрываем paywall
    this.showPaywall = false;
    
    // Теперь генерируем отчет с новыми кредитами
    if (this.currentVin) {
      this.generateReportWithCredits(this.currentVin);
    }
    
    this.currentVin = '';
    this.currentReportId = '';
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

  getReportsText(count: number): string {
    if (count === 1) {
      return 'отчет';
    } else if (count >= 2 && count <= 4) {
      return 'отчета';
    } else {
      return 'отчетов';
    }
  }

  getAddedReportsText(count: number): string {
    if (count === 1) {
      return 'Добавлен 1 отчет';
    } else if (count >= 2 && count <= 4) {
      return `Добавлено ${count} отчета`;
    } else {
      return `Добавлено ${count} отчетов`;
    }
  }

  getCompletedReportsCount(): number {
    return this.userReports.filter(report => report.status === 'completed').length;
  }

  private resetVinInput(): void {
    if (this.vinInputComponent) {
      this.vinInputComponent.resetForm();
    }
  }


  onLoginSuccess(): void {
    this.showLoginModal = false;
    // После успешного входа проверяем баланс и генерируем отчет
    this.checkBalanceAndGenerate(this.currentVin);
  }

  onRegisterSuccess(): void {
    this.showRegisterModal = false;
    // После успешной регистрации проверяем баланс и генерируем отчет
    this.checkBalanceAndGenerate(this.currentVin);
  }

  onSwitchToRegister(): void {
    this.showLoginModal = false;
    this.showRegisterModal = true;
    // VIN уже сохранен в currentVin
  }

  onSwitchToLogin(): void {
    this.showRegisterModal = false;
    this.showLoginModal = true;
    // VIN уже сохранен в currentVin
  }
}
