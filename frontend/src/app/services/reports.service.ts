import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  id: string;
  vin: string;
  user_id: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  price: number;
  pdf_file_name?: string;
  generated_at?: string;
  created_at: string;
  updated_at: string;
  downloadUrl?: string;
}

export interface RequestReportRequest {
  vin: string;
}

export interface RequestReportResponse {
  reportId: string;
  status: 'available' | 'payment_required' | 'generating';
  downloadUrl?: string;
  price?: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  requestReport(vin: string): Observable<RequestReportResponse> {
    return this.http.post<RequestReportResponse>(`${this.apiUrl}/reports/request`, { vin });
  }

  getReport(reportId: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/reports/${reportId}`);
  }

  downloadReport(reportId: string): Observable<{ downloadUrl: string }> {
    return this.http.get<{ downloadUrl: string }>(`${this.apiUrl}/reports/${reportId}/download`);
  }

  getUserReports(): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/reports`);
  }
}
