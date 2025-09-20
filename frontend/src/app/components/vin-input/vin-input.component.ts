import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-vin-input',
  template: `
    <div class="w-full">
      <form [formGroup]="vinForm" (ngSubmit)="onSubmit()">
        <div class="form-group mb-4">
          <label for="vin" class="block text-lg font-medium text-gray-900 mb-3">
            Введите VIN номер для получения отчёта CarFax
          </label>
          <div class="relative">
            <input
              id="vin"
              type="text"
              formControlName="vin"
              placeholder="1HGBH41JXMN109186"
              maxlength="17"
              class="form-input vin-input h-12 text-lg pr-20"
              (input)="onVinInput($event)"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <!-- Кнопка "Вставить" когда поле пустое -->
              <button
                *ngIf="!hasValue"
                type="button"
                (click)="pasteFromClipboard()"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded transition-colors"
              >
                Вставить
              </button>
              <!-- Кнопка "Очистить" когда есть текст -->
              <button
                *ngIf="hasValue"
                type="button"
                (click)="clearInput()"
                class="text-gray-400 hover:text-gray-600 transition-colors p-1"
                title="Очистить поле"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div *ngIf="vinForm.get('vin')?.invalid && submitted" 
               class="mt-2 text-sm text-danger">
            <div *ngIf="vinForm.get('vin')?.errors?.['required']">
              VIN номер обязателен
            </div>
            <div *ngIf="vinForm.get('vin')?.errors?.['minlength'] || vinForm.get('vin')?.errors?.['maxlength']">
              VIN должен содержать ровно 17 символов
            </div>
            <div *ngIf="vinForm.get('vin')?.errors?.['pattern']">
              VIN содержит недопустимые символы
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <button
            type="submit"
            [disabled]="vinForm.invalid || isLoading"
            class="btn btn-primary h-12 w-full text-base font-semibold"
          >
            <span *ngIf="!isLoading">Получить отчёт CarFax</span>
            <span *ngIf="isLoading" class="flex items-center justify-center">
              <div class="loading-spinner mr-2"></div>
              Загрузка...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class VinInputComponent {
  @Output() vinSubmitted = new EventEmitter<string>();
  
  vinForm: FormGroup;
  isLoading = false;
  hasValue = false;
  submitted = false;

  constructor(private fb: FormBuilder) {
    this.vinForm = this.fb.group({
      vin: ['', [
        Validators.required,
        Validators.minLength(17),
        Validators.maxLength(17),
        Validators.pattern(/^[A-HJ-NPR-Z0-9]{17}$/)
      ]]
    });

    // Отслеживаем изменения в поле VIN
    this.vinForm.get('vin')?.valueChanges.subscribe(value => {
      this.hasValue = !!value && value.length > 0;
    });
  }

  onVinInput(event: any): void {
    const value = event.target.value.toUpperCase();
    event.target.value = value;
    this.vinForm.patchValue({ vin: value });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.vinForm.valid) {
      this.isLoading = true;
      const vin = this.vinForm.get('vin')?.value;
      this.vinSubmitted.emit(vin);
    }
  }

  setLoading(loading: boolean): void {
    this.isLoading = loading;
  }

  resetForm(): void {
    this.vinForm.reset();
    this.isLoading = false;
    this.submitted = false;
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        // Очищаем текст от лишних символов и приводим к верхнему регистру
        const cleanText = text.replace(/[^A-HJ-NPR-Z0-9]/g, '').toUpperCase();
        if (cleanText.length > 0) {
          this.vinForm.patchValue({ vin: cleanText });
        }
      }
    } catch (err) {
      console.error('Ошибка при чтении буфера обмена:', err);
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = '';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('paste');
        const text = textArea.value.replace(/[^A-HJ-NPR-Z0-9]/g, '').toUpperCase();
        if (text.length > 0) {
          this.vinForm.patchValue({ vin: text });
        }
      } catch (fallbackErr) {
        console.error('Fallback paste failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  }

  clearInput(): void {
    this.vinForm.patchValue({ vin: '' });
  }
}
