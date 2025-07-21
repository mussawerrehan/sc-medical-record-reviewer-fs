import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="getButtonClasses()"
      [disabled]="disabled"
      [type]="type"
      (click)="onClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .ui-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      white-space: nowrap;
      border-radius: var(--radius);
      font-size: 0.875rem;
      font-weight: var(--font-weight-medium);
      transition: all 0.15s ease-in-out;
      outline: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
    }

    .ui-btn:focus-visible {
      outline: 2px solid var(--ring);
      outline-offset: 2px;
    }

    .ui-btn:disabled {
      pointer-events: none;
      opacity: 0.5;
    }

    /* Variants */
    .ui-btn-default {
      background-color: var(--primary);
      color: var(--primary-foreground);
    }

    .ui-btn-default:hover:not(:disabled) {
      background-color: var(--medical-primary);
      opacity: 0.9;
    }

    .ui-btn-destructive {
      background-color: var(--destructive);
      color: var(--destructive-foreground);
    }

    .ui-btn-destructive:hover:not(:disabled) {
      opacity: 0.9;
    }

    .ui-btn-outline {
      border: 1px solid var(--border);
      background-color: var(--card);
      color: var(--foreground);
    }

    .ui-btn-outline:hover:not(:disabled) {
      background-color: var(--accent);
      color: var(--accent-foreground);
    }

    .ui-btn-secondary {
      background-color: var(--secondary);
      color: var(--secondary-foreground);
    }

    .ui-btn-secondary:hover:not(:disabled) {
      opacity: 0.8;
    }

    .ui-btn-ghost {
      background-color: transparent;
      color: var(--foreground);
    }

    .ui-btn-ghost:hover:not(:disabled) {
      background-color: var(--accent);
      color: var(--accent-foreground);
    }

    .ui-btn-link {
      background-color: transparent;
      color: var(--medical-primary);
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    .ui-btn-link:hover:not(:disabled) {
      text-decoration: underline;
    }

    /* Sizes */
    .ui-btn-default-size {
      height: 2.25rem;
      padding: 0.5rem 1rem;
    }

    .ui-btn-sm {
      height: 2rem;
      border-radius: var(--radius);
      gap: 0.375rem;
      padding: 0 0.75rem;
    }

    .ui-btn-lg {
      height: 2.5rem;
      border-radius: var(--radius);
      padding: 0 1.5rem;
    }

    .ui-btn-icon {
      height: 2.25rem;
      width: 2.25rem;
      border-radius: var(--radius);
      padding: 0;
    }
  `]
})
export class ButtonComponent implements OnInit {
  @Input() variant: ButtonVariant = 'default';
  @Input() size: ButtonSize = 'default';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() asChild: boolean = false;
  @Input() className: string = '';

  @Output() clickEvent = new EventEmitter<Event>();

  ngOnInit() {}

  onClick(event: Event) {
    if (!this.disabled) {
      this.clickEvent.emit(event);
    }
  }

  getButtonClasses(): string {
    const baseClasses = 'ui-btn';
    const variantClass = `ui-btn-${this.variant}`;
    const sizeClass = this.size === 'default' ? 'ui-btn-default-size' : `ui-btn-${this.size}`;
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${this.className}`.trim();
  }
} 