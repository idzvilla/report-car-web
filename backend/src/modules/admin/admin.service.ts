import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../common/supabase/supabase.service';

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  async getStats() {
    try {
      // Пока используем мок данные, так как SupabaseService не настроен для реальной работы
      return {
        totalReports: 15,
        totalUsers: 8,
        totalPayments: 12,
        totalRevenue: 95.88,
        recentReports: [
          {
            id: '1',
            vin: '1HGBH41JXMN109186',
            status: 'completed',
            created_at: '2025-09-21T00:00:00Z',
            users: { email: 'user1@example.com' }
          },
          {
            id: '2',
            vin: '2HGBH41JXMN109187',
            status: 'pending',
            created_at: '2025-09-21T01:00:00Z',
            users: { email: 'user2@example.com' }
          }
        ],
        recentUsers: [
          {
            id: '1',
            email: 'user1@example.com',
            created_at: '2025-09-20T00:00:00Z',
            credits: { credits_total: 5, credits_remaining: 3 }
          },
          {
            id: '2',
            email: 'user2@example.com',
            created_at: '2025-09-20T01:00:00Z',
            credits: { credits_total: 10, credits_remaining: 7 }
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalReports: 0,
        totalUsers: 0,
        totalPayments: 0,
        totalRevenue: 0,
        recentReports: [],
        recentUsers: []
      };
    }
  }

  async getAllUsers() {
    try {
      // Пока используем мок данные
      return [
        {
          id: '1',
          email: 'user1@example.com',
          created_at: '2025-09-20T00:00:00Z',
          credits: { credits_total: 5, credits_remaining: 3 }
        },
        {
          id: '2',
          email: 'user2@example.com',
          created_at: '2025-09-20T01:00:00Z',
          credits: { credits_total: 10, credits_remaining: 7 }
        },
        {
          id: '3',
          email: 'user3@example.com',
          created_at: '2025-09-20T02:00:00Z',
          credits: { credits_total: 1, credits_remaining: 0 }
        }
      ];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getAllReports() {
    try {
      // Пока используем мок данные
      return [
        {
          id: '1',
          vin: '1HGBH41JXMN109186',
          status: 'completed',
          created_at: '2025-09-21T00:00:00Z',
          users: { email: 'user1@example.com' }
        },
        {
          id: '2',
          vin: '2HGBH41JXMN109187',
          status: 'pending',
          created_at: '2025-09-21T01:00:00Z',
          users: { email: 'user2@example.com' }
        },
        {
          id: '3',
          vin: '3HGBH41JXMN109188',
          status: 'generating',
          created_at: '2025-09-21T02:00:00Z',
          users: { email: 'user3@example.com' }
        }
      ];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  async updateUserCredits(userId: string, credits: number) {
    try {
      // Пока просто возвращаем успешный результат
      console.log(`Updating user ${userId} credits to ${credits}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating user credits:', error);
      throw error;
    }
  }
}