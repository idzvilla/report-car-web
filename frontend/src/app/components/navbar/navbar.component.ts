import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <a routerLink="/" class="flex-shrink-0 flex items-center">
              <h1 class="text-2xl font-bold text-gray-900">CarFax Web</h1>
            </a>
          </div>
          
          <div class="flex items-center space-x-4">
            <ng-container *ngIf="!isAuthenticated; else authenticatedMenu">
              <button (click)="showLogin()" class="btn btn-outline btn-md">
                Войти
              </button>
              <button (click)="showRegister()" class="btn btn-primary btn-md">
                Регистрация
              </button>
            </ng-container>
            
            <ng-template #authenticatedMenu>
              <div class="flex items-center space-x-4">
                <button (click)="openBalanceModal()" class="btn btn-md flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-3 rounded-lg transition-colors">
                  <span class="text-sm text-gray-600">Баланс:</span>
                  <span class="text-sm font-semibold text-gray-900">
                    {{ currentUser?.credits?.credits_remaining || 0 }} {{ getReportsText(currentUser?.credits?.credits_remaining || 0) }}
                  </span>
                </button>
                <a routerLink="/admin" class="btn btn-outline btn-md">
                  Админ
                </a>
                <button (click)="logout()" class="btn btn-outline btn-md">
                  Выйти
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>

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

    <!-- Balance Modal -->
    <app-balance-modal
      [isVisible]="showBalanceModal"
      (close)="showBalanceModal = false"
      (paymentSuccess)="onBalancePaymentSuccess($event)"
    ></app-balance-modal>

    <!-- Toast -->
    <app-toast
      [toasts]="toasts"
      (remove)="onRemoveToast($event)"
    ></app-toast>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;
  showLoginModal = false;
  showRegisterModal = false;
  showBalanceModal = false;
  toasts: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });

    // Подписываемся на toast'ы
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  showLogin(): void {
    this.showLoginModal = true;
  }

  showRegister(): void {
    this.showRegisterModal = true;
  }

  onLoginSuccess(): void {
    this.showLoginModal = false;
  }

  onRegisterSuccess(): void {
    this.showRegisterModal = false;
  }

  onSwitchToRegister(): void {
    this.showLoginModal = false;
    this.showRegisterModal = true;
  }

  onSwitchToLogin(): void {
    this.showRegisterModal = false;
    this.showLoginModal = true;
  }

  openBalanceModal(): void {
    this.showBalanceModal = true;
  }

  onBalancePaymentSuccess(paymentData: { credits: number, plan: string }): void {
    this.showBalanceModal = false;
    
    // Обновляем баланс пользователя после успешной оплаты
    if (this.currentUser) {
      const updatedUser = {
        ...this.currentUser,
        credits: {
          credits_total: (this.currentUser.credits?.credits_total || 0) + paymentData.credits,
          credits_remaining: (this.currentUser.credits?.credits_remaining || 0) + paymentData.credits
        }
      };
      this.authService.setCurrentUser(updatedUser);
      
      // Показываем toast об успешной покупке
      this.toastService.showSuccess(
        'Баланс пополнен!',
        this.getAddedReportsText(paymentData.credits)
      );
    }
  }

  onRemoveToast(toastId: string): void {
    this.toastService.remove(toastId);
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

  logout(): void {
    // Просто очищаем данные пользователя и перенаправляем
    this.authService.clearUser();
    this.router.navigate(['/']);
  }
}
