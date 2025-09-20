import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  template: `
    <div class="fixed bottom-4 left-4 right-4 z-50 space-y-2">
      <div 
        *ngFor="let toast of toasts" 
        class="toast-item"
        [class]="getToastClasses(toast.type)"
        [@slideIn]
      >
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center min-w-0 flex-1">
            <div class="w-2 h-2 rounded-full bg-gray-400 mr-3 flex-shrink-0"></div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-gray-900 truncate mb-1">{{ toast.title }}</p>
              <p *ngIf="toast.message" class="text-xs text-gray-500 truncate">{{ toast.message }}</p>
            </div>
          </div>
          <button 
            (click)="removeToast(toast.id)"
            class="ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-150 flex-shrink-0"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-item {
      @apply w-full max-w-sm bg-white shadow-lg rounded-lg pointer-events-auto border border-gray-200;
    }
    
    .toast-success .w-2 {
      @apply bg-green-500;
    }
    
    .toast-error .w-2 {
      @apply bg-red-500;
    }
    
    .toast-info .w-2 {
      @apply bg-blue-500;
    }
    
    .toast-warning .w-2 {
      @apply bg-yellow-500;
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  @Input() toasts: ToastMessage[] = [];
  @Output() remove = new EventEmitter<string>();

  getToastClasses(type: string): string {
    return `toast-${type}`;
  }


  removeToast(id: string): void {
    this.remove.emit(id);
  }
}
