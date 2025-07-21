/// <reference types="cypress" />
import { mount } from 'cypress/angular';
import { ClaimsListComponent } from '../../src/app/components/claims/claims-list/claims-list.component';
import { ClaimsService } from '../../src/app/services/claims.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClaimStatus, ClaimType } from '../../src/app/models';
import { MountConfig } from 'cypress/angular';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      stub: (obj: any, method: string) => Chainable<any>;
    }
  }
}

const expectedColumns = ['ID', 'Type', 'Status', 'Date of Service', 'Amount', 'Actions'] as const;
type ColumnType = typeof expectedColumns[number];

describe('ClaimsListComponent', () => {
  const mockClaims = [
    {
      id: '1',
      type: ClaimType.PROFESSIONAL,
      status: ClaimStatus.DRAFT,
      dateOfService: new Date('2024-07-17'),
      totalAmount: 1500.50
    },
    {
      id: '2',
      type: ClaimType.INSTITUTIONAL,
      status: ClaimStatus.SUBMITTED,
      dateOfService: new Date('2024-07-16'),
      totalAmount: 2500.75
    }
  ];

  beforeEach(() => {
    // Create stub for ClaimsService
    cy.stub(ClaimsService.prototype, 'getClaims')
      .as('getClaims')
      .returns({ claims: mockClaims });

    // Mount component with dependencies
    cy.mount<ClaimsListComponent>(ClaimsListComponent, {
      imports: [BrowserAnimationsModule],
      providers: [ClaimsService]
    });
  });

  it('should create', () => {
    cy.get('app-claims-list').should('exist');
  });

  it('should display claims table with correct columns', () => {
    cy.get('th').each(($el, index) => {
      const column = expectedColumns[index];
      if (column) {
        cy.wrap($el).should('contain.text', column);
      }
    });
  });

  it('should load and display claims data', () => {
    cy.get('@getClaims').should('have.been.called');
    cy.get('table tbody tr').should('have.length', 2);
    
    // Verify first row data
    cy.get('table tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain.text', '1');
      cy.get('td').eq(1).should('contain.text', 'Professional');
      cy.get('td').eq(2).should('contain.text', 'Draft');
      cy.get('td').eq(3).should('contain.text', 'Jul 17, 2024');
      cy.get('td').eq(4).should('contain.text', '$1,500.50');
    });
  });

  it('should show correct chip colors for claim types', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('mat-chip').first().should('have.class', 'mat-primary');
    });
    cy.get('table tbody tr').eq(1).within(() => {
      cy.get('mat-chip').first().should('have.class', 'mat-accent');
    });
  });

  it('should show correct chip colors for claim statuses', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.get('mat-chip').eq(1).should('not.have.class', 'mat-primary');
    });
    cy.get('table tbody tr').eq(1).within(() => {
      cy.get('mat-chip').eq(1).should('have.class', 'mat-primary');
    });
  });

  it('should show action menu with correct options', () => {
    // Open action menu for first claim
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[matMenuTriggerFor]').click();
    });

    // Verify menu options
    cy.get('mat-menu').within(() => {
      cy.get('button').should('have.length', 4); // View, Edit, Delete, Submit
      cy.contains('button', 'View').should('exist');
      cy.contains('button', 'Edit').should('exist');
      cy.contains('button', 'Delete').should('exist');
      cy.contains('button', 'Submit').should('exist');
    });
  });

  it('should show Submit option only for DRAFT claims', () => {
    // Check DRAFT claim
    cy.get('table tbody tr').first().within(() => {
      cy.get('button[matMenuTriggerFor]').click();
    });
    cy.get('mat-menu').contains('button', 'Submit').should('exist');

    // Check SUBMITTED claim
    cy.get('table tbody tr').eq(1).within(() => {
      cy.get('button[matMenuTriggerFor]').click();
    });
    cy.get('mat-menu').contains('button', 'Submit').should('not.exist');
  });

  it('should navigate to create claim page when clicking New Claim button', () => {
    const routerSpy = cy.spy(cy.state('window').router, 'navigate');
    cy.contains('button', 'New Claim').click();
    cy.wrap(routerSpy).should('have.been.calledWith', ['/claims/new']);
  });

  it('should handle pagination', () => {
    cy.get('mat-paginator').should('exist');
    cy.get('mat-paginator').contains('1 – 2 of 2');
    cy.get('button[aria-label="First page"]').should('be.disabled');
    cy.get('button[aria-label="Last page"]').should('be.disabled');
  });

  it('should handle sorting', () => {
    // Test ID column sorting
    cy.get('th').contains('ID').click();
    cy.get('table tbody tr').first().should('contain.text', '1');
    cy.get('th').contains('ID').click();
    cy.get('table tbody tr').first().should('contain.text', '2');
  });
}); 