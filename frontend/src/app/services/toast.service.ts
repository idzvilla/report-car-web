import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastMessage } from '../components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastId = 0;

  showSuccess(title: string, message?: string, duration: number = 5000): void {
    this.show({
      id: `toast-${++this.toastId}`,
      type: 'success',
      title,
      message,
      duration
    });
  }

  showError(title: string, message?: string, duration: number = 5000): void {
    this.show({
      id: `toast-${++this.toastId}`,
      type: 'error',
      title,
      message,
      duration
    });
  }

  showInfo(title: string, message?: string, duration: number = 5000): void {
    this.show({
      id: `toast-${++this.toastId}`,
      type: 'info',
      title,
      message,
      duration
    });
  }

  showWarning(title: string, message?: string, duration: number = 5000): void {
    this.show({
      id: `toast-${++this.toastId}`,
      type: 'warning',
      title,
      message,
      duration
    });
  }

  private show(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Автоматически удаляем toast через указанное время (по умолчанию 5 секунд)
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.remove(toast.id);
      }, toast.duration);
    }
  }

  remove(toastId: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== toastId));
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
