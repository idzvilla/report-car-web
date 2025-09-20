import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  template: `
    <div *ngIf="isVisible" class="modal-overlay">
      <div class="modal max-w-md">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-900">Вход в аккаунт</h3>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="form-group mb-4">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="your@email.com"
                class="form-input"
                [class.border-danger]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              />
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" 
                   class="mt-1 text-sm text-danger">
                <div *ngIf="loginForm.get('email')?.errors?.['required']">
                  Email обязателен
                </div>
                <div *ngIf="loginForm.get('email')?.errors?.['email']">
                  Введите корректный email
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="form-group mb-6">
              <label for="password" class="form-label">Пароль</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Введите пароль"
                class="form-input"
                [class.border-danger]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
              />
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" 
                   class="mt-1 text-sm text-danger">
                <div *ngIf="loginForm.get('password')?.errors?.['required']">
                  Пароль обязателен
                </div>
                <div *ngIf="loginForm.get('password')?.errors?.['minlength']">
                  Пароль должен содержать минимум 6 символов
                </div>
              </div>
            </div>

            <!-- Login Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="btn btn-primary w-full h-12 text-base font-semibold mb-4"
            >
              <span *ngIf="!isLoading">Войти</span>
              <span *ngIf="isLoading" class="flex items-center justify-center">
                <div class="loading-spinner mr-2"></div>
                Входим...
              </span>
            </button>

            <!-- Divider -->
            <div class="relative mb-4">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">или</span>
              </div>
            </div>

            <!-- Telegram Login -->
            <button
              type="button"
              (click)="loginWithTelegram()"
              [disabled]="isLoading"
              class="btn btn-telegram w-full h-12 text-base font-semibold mb-4"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.44l-2.49-1.84-1.2 1.15c-.13.13-.24.24-.49.24l.18-2.56 4.64-4.19c.2-.18-.04-.28-.31-.1l-5.74 3.61-2.47-.77c-.54-.17-.55-.54.11-.8l9.7-3.74c.45-.17.85.1.7.8z"/>
              </svg>
              Войти через Telegram
            </button>

            <!-- Switch to Register -->
            <div class="text-center">
              <span class="text-sm text-gray-600">Нет аккаунта? </span>
              <button (click)="switchToRegister.emit()" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Зарегистрироваться
              </button>
            </div>
          </form>
          
          <div *ngIf="error" class="text-center text-danger text-sm mt-4 p-3 bg-red-50 rounded-lg">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginModalComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();

  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onClose(): void {
    this.loginForm.reset();
    this.isLoading = false;
    this.error = '';
    this.close.emit();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';

      const { email, password } = this.loginForm.value;
      
      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.loginSuccess.emit();
          this.onClose();
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Ошибка входа. Проверьте данные.';
        }
      });
    }
  }

  loginWithTelegram(): void {
    this.isLoading = true;
    this.error = '';

    // Временная заглушка для тестирования
    console.log('Telegram auth temporarily disabled for testing');
    
    // Создаем тестового пользователя
    const testUser = {
      id: 'test-user-123',
      fullName: 'Test User',
      authProvider: 'telegram' as 'telegram',
      telegramId: '123456789',
      username: 'testuser',
      photoUrl: 'https://via.placeholder.com/50x50/0088cc/ffffff?text=T'
    };
    
    this.authService.setCurrentUser(testUser);
    this.isLoading = false;
    this.loginSuccess.emit();
    this.onClose();
  }
}
