import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  id: string;
  user_id: string;
  report_id?: string;
  payment_type: 'single' | 'bulk';
  amount: number;
  stripe_payment_intent_id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  reportId?: string;
  paymentType: 'single' | 'bulk';
}

export interface CreatePaymentResponse {
  clientSecret: string;
  paymentId: string;
  amount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = process.env['API_URL'] || 'http://localhost:3000/api/v1';

  constructor(private http: HttpClient) { }

  createPayment(request: CreatePaymentRequest): Observable<CreatePaymentResponse> {
    return this.http.post<CreatePaymentResponse>(`${this.apiUrl}/payments/create`, request);
  }

  getUserPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/payments`);
  }
}
