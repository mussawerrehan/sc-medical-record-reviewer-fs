import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <input
      [class]="getInputClasses()"
      [type]="type"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [value]="value"
      (input)="onInput($event)"
      (blur)="onBlur()"
      (focus)="onFocus()"
    />
  `,
  styles: [`
    .ui-input {
      display: flex;
      height: 2.25rem;
      width: 100%;
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background-color: var(--input-background);
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      transition: all 0.15s ease-in-out;
      outline: none;
    }

    .ui-input::placeholder {
      color: var(--muted-foreground);
    }

    .ui-input:focus {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
      border-color: var(--medical-primary);
    }

    .ui-input:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .ui-input[aria-invalid="true"] {
      border-color: var(--destructive);
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() className: string = '';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  private onChange = (value: string) => {};
  private onTouched = () => {};

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }

  onBlur() {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus() {
    this.inputFocus.emit();
  }

  getInputClasses(): string {
    return `ui-input ${this.className}`.trim();
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