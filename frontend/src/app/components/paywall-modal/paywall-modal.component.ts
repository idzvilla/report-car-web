import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentsService } from '../../services/payments.service';

@Component({
  selector: 'app-paywall-modal',
  template: `
    <div *ngIf="isVisible" class="modal-overlay">
      <div class="modal">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-900">Выберите тариф</h3>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <div class="text-center mb-6">
            <p class="text-gray-600 mb-2">VIN: {{ vin }}</p>
          </div>
          
          <div class="space-y-3">
            <!-- Single Report -->
            <div class="border rounded-lg p-4 transition-all cursor-pointer" 
                 [class.border-primary-300]="selectedPlan === 'single'"
                 [class.bg-primary-50]="selectedPlan === 'single'"
                 [class.border-gray-200]="selectedPlan !== 'single'"
                 [class.bg-white]="selectedPlan !== 'single'"
                 (click)="selectPlan('single')">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">Одиночный отчёт</h4>
                    <span class="ml-2 px-2 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">Популярно</span>
                  </div>
                  <p class="text-sm text-gray-500">Без регистрации</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-primary-600">$2.00</div>
                </div>
              </div>
            </div>
            
            <!-- Bulk Package -->
            <div class="border rounded-lg p-4 transition-all cursor-pointer" 
                 [class.border-primary-300]="selectedPlan === 'bulk'"
                 [class.bg-primary-50]="selectedPlan === 'bulk'"
                 [class.border-gray-200]="selectedPlan !== 'bulk'"
                 [class.bg-white]="selectedPlan !== 'bulk'"
                 (click)="selectPlan('bulk')">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center mb-2">
                    <h4 class="text-lg font-semibold text-gray-900">100 отчётов</h4>
                    <span class="ml-2 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">Экономия $101</span>
                  </div>
                  <p class="text-sm text-gray-500">Требуется регистрация</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-primary-600">$99.00</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Payment Button -->
          <div *ngIf="selectedPlan" class="mt-6">
            <button 
              (click)="processPayment()"
              [disabled]="isProcessing"
              class="btn btn-primary w-full h-12 text-lg font-semibold"
            >
              <span *ngIf="!isProcessing">Оплатить {{ getSelectedPlanPrice() }}</span>
              <span *ngIf="isProcessing" class="flex items-center justify-center">
                <div class="loading-spinner mr-2"></div>
                Пропускаем оплату для тестирования...
              </span>
            </button>
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
export class PaywallModalComponent {
  @Input() isVisible = false;
  @Input() vin = '';
  @Input() reportId = '';
  @Output() close = new EventEmitter<void>();
  @Output() paymentSuccess = new EventEmitter<void>();
  
  selectedPlan: 'single' | 'bulk' | null = null;
  isProcessing = false;
  error = '';

  constructor(private paymentsService: PaymentsService) {}

  onClose(): void {
    this.selectedPlan = null;
    this.isProcessing = false;
    this.error = '';
    this.close.emit();
  }

  selectPlan(plan: 'single' | 'bulk'): void {
    this.selectedPlan = plan;
    this.error = '';
  }

  getSelectedPlanPrice(): string {
    if (this.selectedPlan === 'single') {
      return '$2.00';
    } else if (this.selectedPlan === 'bulk') {
      return '$99.00';
    }
    return '';
  }

  processPayment(): void {
    if (!this.selectedPlan) return;

    this.isProcessing = true;
    this.error = '';

    // Для тестирования просто ждем 1 секунду и переходим дальше
    console.log('Processing payment for plan:', this.selectedPlan);
    
    setTimeout(() => {
      this.isProcessing = false;
      this.paymentSuccess.emit();
      this.onClose();
    }, 1000);
  }
}
