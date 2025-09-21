import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminStats {
  totalReports: number;
  totalUsers: number;
  totalPayments: number;
  totalRevenue: number;
  recentReports: any[];
  recentUsers: any[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  credits?: {
    credits_total: number;
    credits_remaining: number;
  };
}

export interface Report {
  id: string;
  vin: string;
  status: string;
  created_at: string;
  users?: {
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/admin/stats`);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  getReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/admin/reports`);
  }

  updateUserCredits(userId: string, credits: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/credits`, { credits });
  }
}
