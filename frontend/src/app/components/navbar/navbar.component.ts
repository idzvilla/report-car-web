import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

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
              <button (click)="loginWithTelegram()" class="btn btn-primary flex items-center space-x-2">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.59c-.12.56-.44.7-.9.44l-2.49-1.84-1.2 1.15c-.13.13-.24.24-.49.24l.18-2.56 4.64-4.19c.2-.18-.04-.28-.31-.1l-5.74 3.61-2.47-.77c-.54-.17-.55-.54.11-.8l9.7-3.74c.45-.17.85.1.7.8z"/>
                </svg>
                <span>Войти через Telegram</span>
              </button>
            </ng-container>
            
            <ng-template #authenticatedMenu>
              <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2">
                  <img *ngIf="currentUser?.photoUrl" 
                       [src]="currentUser?.photoUrl" 
                       [alt]="currentUser?.fullName"
                       class="w-8 h-8 rounded-full">
                  <span class="text-sm text-gray-700">
                    Привет, {{ currentUser?.fullName || currentUser?.email }}!
                  </span>
                  <span *ngIf="currentUser?.authProvider === 'telegram'" 
                        class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    Telegram
                  </span>
                </div>
                <a routerLink="/profile" class="btn btn-outline btn-sm">
                  Профиль
                </a>
                <a routerLink="/admin" class="btn btn-outline btn-sm">
                  Админ
                </a>
                <button (click)="logout()" class="btn btn-outline btn-sm">
                  Выйти
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

      loginWithTelegram(): void {
        // Временная заглушка для тестирования
        console.log('Telegram auth temporarily disabled for testing');
        
        // Создаем тестового пользователя
        const testUser = {
          id: 'test-user-123',
          fullName: 'Test User',
          authProvider: 'telegram',
          telegramId: '123456789',
          username: 'testuser',
          photoUrl: 'https://via.placeholder.com/50x50/0088cc/ffffff?text=T'
        };
        
        this.authService.setCurrentUser(testUser);
        alert('✅ Вход выполнен (тестовый режим)');
      }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Ошибка выхода:', error);
        // Всё равно перенаправляем на главную
        this.router.navigate(['/']);
      }
    });
  }
}
