import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentsService } from '../../services/payments.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-balance-modal',
  template: `
    <div *ngIf="isVisible" class="modal-overlay">
      <div class="modal max-w-2xl">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Пополнить баланс</h3>
              <p class="text-sm text-gray-500 mt-1 mb-0">Выберите количество отчётов для покупки</p>
            </div>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <!-- Pricing Plans List -->
          <div class="space-y-2 mb-4">
            <!-- 1 Report Plan -->
            <div class="relative border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm" 
                 [class.border-primary]="selectedPlan === 'single'"
                 [class.bg-primary-light]="selectedPlan === 'single'"
                 [class.border-gray-200]="selectedPlan !== 'single'"
                 [class.bg-white]="selectedPlan !== 'single'"
                 (click)="selectPlan('single')">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center"
                       [class.border-primary]="selectedPlan === 'single'"
                       [class.bg-primary]="selectedPlan === 'single'"
                       [class.border-gray-300]="selectedPlan !== 'single'">
                    <div *ngIf="selectedPlan === 'single'" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div class="text-base font-semibold text-gray-900">1 отчёт</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-gray-900">$7.99</div>
                </div>
              </div>
            </div>

            <!-- 5 Reports Plan -->
            <div class="relative border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm" 
                 [class.border-primary]="selectedPlan === 'pack5'"
                 [class.bg-primary-light]="selectedPlan === 'pack5'"
                 [class.border-gray-200]="selectedPlan !== 'pack5'"
                 [class.bg-white]="selectedPlan !== 'pack5'"
                 (click)="selectPlan('pack5')">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center"
                       [class.border-primary]="selectedPlan === 'pack5'"
                       [class.bg-primary]="selectedPlan === 'pack5'"
                       [class.border-gray-300]="selectedPlan !== 'pack5'">
                    <div *ngIf="selectedPlan === 'pack5'" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div class="text-base font-semibold text-gray-900">5 отчётов</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-gray-900">$14.98</div>
                  <div class="text-xs text-gray-500">$4.99 за отчёт</div>
                </div>
              </div>
            </div>

            <!-- 100 Reports Plan -->
            <div class="relative border rounded-lg p-3 transition-all cursor-pointer hover:shadow-sm" 
                 [class.border-primary]="selectedPlan === 'pack100'"
                 [class.bg-primary-light]="selectedPlan === 'pack100'"
                 [class.border-gray-200]="selectedPlan !== 'pack100'"
                 [class.bg-white]="selectedPlan !== 'pack100'"
                 (click)="selectPlan('pack100')">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center"
                       [class.border-primary]="selectedPlan === 'pack100'"
                       [class.bg-primary]="selectedPlan === 'pack100'"
                       [class.border-gray-300]="selectedPlan !== 'pack100'">
                    <div *ngIf="selectedPlan === 'pack100'" class="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <div class="text-base font-semibold text-gray-900">100 отчётов</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-gray-900">$19.99</div>
                  <div class="text-xs text-gray-500">$3.99 за отчёт</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Button -->
          <div class="mt-6">
            <button 
              (click)="processPayment()"
              [disabled]="!selectedPlan || isProcessing"
              class="btn w-full h-12 text-base font-semibold"
              [class.btn-primary]="selectedPlan && !isProcessing"
              [class.btn-disabled]="!selectedPlan || isProcessing"
            >
              <span *ngIf="!isProcessing && selectedPlan">Оплатить {{ getSelectedPlanPrice() }}</span>
              <span *ngIf="!isProcessing && !selectedPlan">Выберите план</span>
              <span *ngIf="isProcessing" class="flex items-center justify-center">
                <div class="loading-spinner mr-2"></div>
                Обрабатываем оплату...
              </span>
            </button>
            <p class="text-xs text-gray-500 text-center mt-2">
              Безопасная оплата через Stripe • Отчёты доступны сразу после оплаты
            </p>
          </div>
          
          <div *ngIf="error" class="text-center text-danger text-sm mt-4 p-3 bg-red-50 rounded-lg">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class BalanceModalComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<{ credits: number, plan: string }>();
  
  selectedPlan: 'single' | 'pack5' | 'pack100' | null = null;
  isProcessing = false;
  error = '';

  constructor(
    private paymentsService: PaymentsService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  onClose(): void {
    this.selectedPlan = null;
    this.isProcessing = false;
    this.error = '';
    this.close.emit();
  }

  selectPlan(plan: 'single' | 'pack5' | 'pack100'): void {
    this.selectedPlan = plan;
    this.error = '';
  }

  getSelectedPlanPrice(): string {
    switch (this.selectedPlan) {
      case 'single':
        return '$7.99';
      case 'pack5':
        return '$14.98';
      case 'pack100':
        return '$19.99';
      default:
        return '';
    }
  }

  getSelectedPlanCredits(): number {
    switch (this.selectedPlan) {
      case 'single':
        return 1;
      case 'pack5':
        return 5;
      case 'pack100':
        return 100;
      default:
        return 0;
    }
  }

  getSelectedPlanName(): string {
    switch (this.selectedPlan) {
      case 'single':
        return '1 отчёт';
      case 'pack5':
        return '5 отчётов';
      case 'pack100':
        return '100 отчётов';
      default:
        return '';
    }
  }

  processPayment(): void {
    if (!this.selectedPlan) return;

    this.isProcessing = true;
    this.error = '';

    // Для тестирования просто ждем 1 секунду и переходим дальше
    console.log('Processing balance top-up for plan:', this.selectedPlan);
    
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentSuccess.emit({
        credits: this.getSelectedPlanCredits(),
        plan: this.getSelectedPlanName()
      });
      this.onClose();
    }, 1000);
  }
}
