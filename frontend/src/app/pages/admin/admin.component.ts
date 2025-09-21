import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { AdminService, AdminStats, User, Report } from '../../services/admin.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  stats: AdminStats | null = null;
  users: User[] = [];
  reports: Report[] = [];
  loading = false;
  toasts: any[] = [];

  constructor(
    private toastService: ToastService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    
    // Subscribe to toasts
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Загружаем статистику
    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.toastService.showError('Ошибка загрузки статистики', 'Не удалось загрузить данные статистики');
        this.loading = false;
      }
    });

    // Загружаем пользователей
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastService.showError('Ошибка загрузки пользователей', 'Не удалось загрузить список пользователей');
      }
    });

    // Загружаем отчеты
    this.adminService.getReports().subscribe({
      next: (reports) => {
        this.reports = reports;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.toastService.showError('Ошибка загрузки отчетов', 'Не удалось загрузить список отчетов');
      }
    });
  }

  updateUserCredits(user: User): void {
    const currentCredits = user.credits?.credits_remaining || 0;
    const newCredits = prompt(`Введите новое количество credits для ${user.email}:`, currentCredits.toString());
    if (newCredits !== null) {
      const credits = parseInt(newCredits, 10);
      if (!isNaN(credits) && credits >= 0) {
        this.adminService.updateUserCredits(user.id, credits).subscribe({
          next: () => {
            // Обновляем локальные данные
            if (!user.credits) {
              user.credits = { credits_total: 0, credits_remaining: 0 };
            }
            user.credits.credits_total = credits;
            user.credits.credits_remaining = credits;
            
            this.toastService.showSuccess(
              'Credits обновлены!',
              `Пользователю ${user.email} установлено ${credits} credits`
            );
          },
          error: (error) => {
            console.error('Error updating credits:', error);
            this.toastService.showError(
              'Ошибка обновления',
              'Не удалось обновить credits пользователя'
            );
          }
        });
      } else {
        this.toastService.showError(
          'Ошибка ввода',
          'Пожалуйста, введите корректное число credits (больше или равно 0)'
        );
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Завершён';
      case 'pending':
        return 'В обработке';
      case 'error':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  }

  onRemoveToast(toastId: string): void {
    this.toastService.remove(toastId);
  }
}