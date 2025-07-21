import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getCardClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .ui-card {
      border-radius: var(--radius);
      border: 1px solid var(--border);
      background-color: var(--card);
      color: var(--card-foreground);
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease-in-out;
    }

    .ui-card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class CardComponent {
  @Input() className: string = '';

  getCardClasses(): string {
    return `ui-card ${this.className}`.trim();
  }
}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getHeaderClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .ui-card-header {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 1.5rem;
      padding-bottom: 0;
    }
  `]
})
export class CardHeaderComponent {
  @Input() className: string = '';

  getHeaderClasses(): string {
    return `ui-card-header ${this.className}`.trim();
  }
}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 [class]="getTitleClasses()">
      <ng-content></ng-content>
    </h3>
  `,
  styles: [`
    .ui-card-title {
      font-size: 1.125rem;
      font-weight: var(--font-weight-medium);
      line-height: 1.25;
      margin: 0;
    }
  `]
})
export class CardTitleComponent {
  @Input() className: string = '';

  getTitleClasses(): string {
    return `ui-card-title ${this.className}`.trim();
  }
}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p [class]="getDescriptionClasses()">
      <ng-content></ng-content>
    </p>
  `,
  styles: [`
    .ui-card-description {
      color: var(--muted-foreground);
      font-size: 0.875rem;
      margin: 0;
    }
  `]
})
export class CardDescriptionComponent {
  @Input() className: string = '';

  getDescriptionClasses(): string {
    return `ui-card-description ${this.className}`.trim();
  }
}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getContentClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .ui-card-content {
      padding: 1.5rem;
      padding-top: 0;
    }
  `]
})
export class CardContentComponent {
  @Input() className: string = '';

  getContentClasses(): string {
    return `ui-card-content ${this.className}`.trim();
  }
}

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getFooterClasses()">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .ui-card-footer {
      display: flex;
      align-items: center;
      padding: 1.5rem;
      padding-top: 0;
    }
  `]
})
export class CardFooterComponent {
  @Input() className: string = '';

  getFooterClasses(): string {
    return `ui-card-footer ${this.className}`.trim();
  }
} 