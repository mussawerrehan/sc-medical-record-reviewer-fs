import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="ui-select-container">
      <select
        [class]="getSelectClasses()"
        [disabled]="disabled"
        [value]="value"
        (change)="onSelectionChange($event)"
        (blur)="onBlur()"
      >
        <option value="" disabled [selected]="!value">{{ placeholder }}</option>
        <option 
          *ngFor="let option of options" 
          [value]="option.value"
          [disabled]="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="ui-select-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6,9 12,15 18,9"></polyline>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    .ui-select-container {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    .ui-select {
      display: flex;
      height: 2.25rem;
      width: 100%;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background-color: var(--input-background);
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      font-size: 0.875rem;
      transition: all 0.15s ease-in-out;
      outline: none;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      cursor: pointer;
    }

    .ui-select:focus {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
      border-color: var(--medical-primary);
    }

    .ui-select:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .ui-select-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted-foreground);
      pointer-events: none;
    }

    .ui-select option {
      background-color: var(--card);
      color: var(--card-foreground);
      padding: 0.5rem;
    }

    .ui-select option:disabled {
      color: var(--muted-foreground);
      cursor: not-allowed;
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() className: string = '';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<SelectOption | null>();

  private onChange = (value: string) => {};
  private onTouched = () => {};

  onSelectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
    
    const selectedOption = this.options.find(option => option.value === this.value) || null;
    this.selectionChange.emit(selectedOption);
  }

  onBlur() {
    this.onTouched();
  }

  getSelectClasses(): string {
    return `ui-select ${this.className}`.trim();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 