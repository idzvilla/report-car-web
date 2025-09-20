import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h1 class="text-2xl font-bold text-gray-900 mb-8">Профиль пользователя</h1>
            
            <div class="grid md:grid-cols-2 gap-8">
              <!-- User Info -->
              <div>
                <h2 class="text-lg font-medium text-gray-900 mb-4">Информация о пользователе</h2>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Имя пользователя</label>
                    <input
                      type="text"
                      [value]="user?.fullName || 'Не указано'"
                      class="mt-1 input-field"
                      readonly
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Telegram ID</label>
                    <input
                      type="text"
                      [value]="user?.telegramId || 'Не указано'"
                      class="mt-1 input-field"
                      readonly
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      [value]="user?.username ? '@' + user?.username : 'Не указано'"
                      class="mt-1 input-field"
                      readonly
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Дата регистрации</label>
                    <input
                      type="text"
                      [value]="user?.createdAt | date:'dd.MM.yyyy HH:mm'"
                      class="mt-1 input-field"
                      readonly
                    />
                  </div>
                </div>
              </div>
              
              <!-- Credits Info -->
              <div>
                <h2 class="text-lg font-medium text-gray-900 mb-4">Credits</h2>
                <div class="bg-primary-50 rounded-lg p-4 mb-4">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-primary-700">Осталось credits:</span>
                    <span class="text-2xl font-bold text-primary-600">
                      {{ user?.credits?.credits_remaining || 0 }}
                    </span>
                  </div>
                  <div class="mt-2 text-sm text-primary-600">
                    Всего куплено: {{ user?.credits?.credits_total || 0 }}
                  </div>
                </div>
                
                <div class="text-sm text-gray-600">
                  <p class="mb-2">Credits используются для получения отчётов по VIN:</p>
                  <ul class="list-disc list-inside space-y-1">
                    <li>1 credit = 1 отчёт</li>
                    <li>Bulk пакет: 100 credits за $99</li>
                    <li>Single отчёт: $2 (без использования credits)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- Messages -->
            <div *ngIf="message" class="mt-4 p-4 rounded-md" 
                 [ngClass]="messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }
}
