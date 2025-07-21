import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getBadgeClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .ui-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 9999px;
      padding: 0.125rem 0.625rem;
      font-size: 0.75rem;
      font-weight: var(--font-weight-medium);
      transition: all 0.15s ease-in-out;
      border: 1px solid transparent;
    }

    .ui-badge-default {
      border-color: transparent;
      background-color: var(--primary);
      color: var(--primary-foreground);
    }

    .ui-badge-secondary {
      border-color: transparent;
      background-color: var(--secondary);
      color: var(--secondary-foreground);
    }

    .ui-badge-destructive {
      border-color: transparent;
      background-color: var(--destructive);
      color: var(--destructive-foreground);
    }

    .ui-badge-outline {
      color: var(--foreground);
      border-color: var(--border);
      background-color: transparent;
    }

    .ui-badge-success {
      border-color: transparent;
      background-color: var(--medical-secondary);
      color: white;
    }

    .ui-badge-warning {
      border-color: transparent;
      background-color: var(--medical-warning);
      color: white;
    }
  `]
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'default';
  @Input() className: string = '';

  getBadgeClasses(): string {
    const baseClasses = 'ui-badge';
    const variantClass = `ui-badge-${this.variant}`;
    
    return `${baseClasses} ${variantClass} ${this.className}`.trim();
  }
} 