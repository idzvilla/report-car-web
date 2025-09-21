import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-modal',
  template: `
    <div *ngIf="isVisible" class="modal-overlay">
      <div class="modal max-w-md">
        <div class="card-header">
          <div class="flex items-center justify-between">
            <h3 class="text-2xl font-bold text-gray-900">Регистрация</h3>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <!-- Full Name -->
            <div class="form-group mb-4">
              <label for="fullName" class="form-label">Полное имя</label>
              <input
                id="fullName"
                type="text"
                formControlName="fullName"
                placeholder="Иван Иванов"
                class="form-input"
                [class.border-danger]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
              />
              <div *ngIf="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched" 
                   class="mt-1 text-sm text-danger">
                <div *ngIf="registerForm.get('fullName')?.errors?.['required']">
                  Имя обязательно
                </div>
                <div *ngIf="registerForm.get('fullName')?.errors?.['minlength']">
                  Имя должно содержать минимум 2 символа
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="form-group mb-4">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="your@email.com"
                class="form-input"
                [class.border-danger]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              />
              <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" 
                   class="mt-1 text-sm text-danger">
                <div *ngIf="registerForm.get('email')?.errors?.['required']">
                  Email обязателен
                </div>
                <div *ngIf="registerForm.get('email')?.errors?.['email']">
                  Введите корректный email
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="form-group mb-4">
              <label for="password" class="form-label">Пароль</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                placeholder="Минимум 6 символов"
                class="form-input"
                [class.border-danger]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
              />
              <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" 
                   class="mt-1 text-sm text-danger">
                <div *ngIf="registerForm.get('password')?.errors?.['required']">
                  Пароль обязателен
                </div>
                <div *ngIf="registerForm.get('password')?.errors?.['minlength']">
                  Пароль должен содержать минимум 6 символов
                </div>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group mb-6">
              <label for="confirmPassword" class="form-label">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                type="password"
                formControlName="confirmPassword"
                placeholder="Повторите пароль"
                class="form-input"
                [class.border-danger]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
              />
              <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" 
                   class="mt-1 text-sm text-danger">
                <div *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                  Подтверждение пароля обязательно
                </div>
                <div *ngIf="registerForm.get('confirmPassword')?.errors?.['mismatch']">
                  Пароли не совпадают
                </div>
              </div>
            </div>

            <!-- Register Button -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="btn btn-primary w-full h-12 text-base font-semibold mb-4"
            >
              <span *ngIf="!isLoading">Зарегистрироваться</span>
              <span *ngIf="isLoading" class="flex items-center justify-center">
                <div class="loading-spinner mr-2"></div>
                Регистрируем...
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

            <!-- Telegram Register -->
            <button
              type="button"
              (click)="registerWithTelegram()"
              [disabled]="isLoading"
              class="btn btn-telegram w-full h-12 text-base font-semibold mb-4"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.44l-2.49-1.84-1.2 1.15c-.13.13-.24.24-.49.24l.18-2.56 4.64-4.19c.2-.18-.04-.28-.31-.1l-5.74 3.61-2.47-.77c-.54-.17-.55-.54.11-.8l9.7-3.74c.45-.17.85.1.7.8z"/>
              </svg>
              Зарегистрироваться через Telegram
            </button>

            <!-- Switch to Login -->
            <div class="text-center">
              <span class="text-sm text-gray-600">Уже есть аккаунт? </span>
              <button (click)="switchToLogin.emit()" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Войти
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
export class RegisterModalComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() registerSuccess = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();

  registerForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  onClose(): void {
    this.registerForm.reset();
    this.isLoading = false;
    this.error = '';
    this.close.emit();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';

      const { fullName, email, password } = this.registerForm.value;
      
      this.authService.register({ fullName, email, password }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.registerSuccess.emit();
          this.onClose();
        },
        error: (error) => {
          this.isLoading = false;
          this.error = error.error?.message || 'Ошибка регистрации. Попробуйте снова.';
        }
      });
    }
  }

  registerWithTelegram(): void {
    this.isLoading = true;
    this.error = '';

    // Временная заглушка для тестирования
    console.log('Telegram registration temporarily disabled for testing');
    
    // Создаем тестового пользователя
    const testUser = {
      id: 'test-user-123',
      fullName: 'Telegram User',
      authProvider: 'telegram' as 'telegram',
      telegramId: '123456789',
      username: 'testuser',
      photoUrl: 'https://via.placeholder.com/50x50/0088cc/ffffff?text=T'
    };
    
    this.authService.setCurrentUser(testUser);
    this.isLoading = false;
    this.registerSuccess.emit();
    this.onClose();
  }
}
