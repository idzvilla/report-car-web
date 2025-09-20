import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email?: string;
  fullName: string;
  createdAt?: string;
  credits?: {
    credits_total: number;
    credits_remaining: number;
  };
  authProvider?: 'email' | 'telegram';
  telegramId?: string;
  username?: string;
  photoUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  session?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setUser(response.user);
          if (response.session) {
            localStorage.setItem('access_token', response.session.access_token);
            localStorage.setItem('refresh_token', response.session.refresh_token);
          }
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setUser(response.user);
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearUser();
        })
      );
  }

  getProfile(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(response => {
          this.setUser(response.user);
        })
      );
  }

  updateEmail(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/update-email`, {
      email,
      password
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  setCurrentUser(user: User): void {
    this.setUser(user);
  }

  private setUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  private clearUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.clearUser();
      }
    }
  }
}
