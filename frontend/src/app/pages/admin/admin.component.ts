import { Component, OnInit } from '@angular/core';

interface DashboardStats {
  totalReports: number;
  totalUsers: number;
  totalPayments: number;
  totalRevenue: number;
  recentReports: any[];
  recentUsers: any[];
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  stats: DashboardStats | null = null;
  users: any[] = [];
  reports: any[] = [];
  loading = false;

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Mock data for now
    this.stats = {
      totalReports: 150,
      totalUsers: 25,
      totalPayments: 89,
      totalRevenue: 1250.50,
      recentReports: [],
      recentUsers: []
    };

    this.users = [
      { email: 'user1@example.com', credits_remaining: 5 },
      { email: 'user2@example.com', credits_remaining: 0 },
      { email: 'user3@example.com', credits_remaining: 10 }
    ];

    this.reports = [
      { vin: '1HGBH41JXMN109186', user_email: 'user1@example.com', status: 'completed', created_at: new Date() },
      { vin: '2HGBH41JXMN109187', user_email: 'user2@example.com', status: 'pending', created_at: new Date() }
    ];

    this.loading = false;
  }

  updateUserCredits(user: any): void {
    const newCredits = prompt(`Введите новое количество credits для ${user.email}:`, user.credits_remaining.toString());
    if (newCredits !== null) {
      const credits = parseInt(newCredits, 10);
      if (!isNaN(credits) && credits >= 0) {
        user.credits_remaining = credits;
        // Here you would call the API to update credits
        console.log(`Updated credits for ${user.email} to ${credits}`);
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
}