import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Report } from '../../services/reports.service';

@Component({
  selector: 'app-report-card',
  template: `
    <div class="card">
      <div class="card-body">
        <div class="flex items-center justify-between h-16">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 font-mono tracking-wider">VIN: {{ report.vin }}</h3>
            <p class="text-sm text-gray-500 mb-0">
              Создан: {{ report.created_at | date:'dd.MM.yyyy HH:mm' }}
            </p>
          </div>
          
          <div class="flex items-center space-x-4">
            <button 
              *ngIf="report.status === 'completed' && report.downloadUrl"
              (click)="onDownload()"
              class="btn btn-primary"
            >
              Скачать PDF
            </button>
            
            <button 
              *ngIf="report.status === 'error'"
              (click)="onRetry()"
              class="btn btn-outline"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ReportCardComponent {
  @Input() report!: Report;
  @Output() download = new EventEmitter<string>();
  @Output() retry = new EventEmitter<string>();

  onDownload(): void {
    this.download.emit(this.report.id);
  }

  onRetry(): void {
    this.retry.emit(this.report.id);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Готов';
      case 'generating':
        return 'Генерируется';
      case 'pending':
        return 'Ожидает';
      case 'error':
        return 'Ошибка';
      default:
        return 'Неизвестно';
    }
  }
}
