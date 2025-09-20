import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-telegram-success',
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 text-green-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Успешная авторизация!
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Вы успешно вошли через Telegram
          </p>
          <div *ngIf="isLoading" class="mt-4">
            <div class="loading-spinner mx-auto"></div>
            <p class="text-sm text-gray-500 mt-2">Загружаем ваш профиль...</p>
          </div>
          <div *ngIf="error" class="mt-4 p-4 bg-red-50 rounded-lg">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TelegramSuccessComponent implements OnInit {
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        this.handleTelegramAuth(token);
      } else {
        this.error = 'Токен авторизации не найден';
        this.isLoading = false;
      }
    });
  }

  private handleTelegramAuth(token: string): void {
    try {
      // Сохраняем токен в localStorage
      localStorage.setItem('auth_token', token);
      
      // Декодируем JWT токен для получения данных пользователя
      const payload = this.parseJwt(token);
      
      // Обновляем состояние авторизации
      this.authService.setCurrentUser({
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName,
        authProvider: payload.authProvider,
        telegramId: payload.telegramId
      });

      this.isLoading = false;
      
      // Перенаправляем на главную страницу через 2 секунды
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
      
    } catch (error) {
      console.error('Error handling Telegram auth:', error);
      this.error = 'Ошибка при обработке авторизации';
      this.isLoading = false;
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }
}
