/// <reference types="cypress" />
import { mount } from 'cypress/angular';
import { ClaimFormComponent } from '../../src/app/components/claims/claim-form/claim-form.component';
import { ClaimsService } from '../../src/app/services/claims.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClaimType } from '../../src/app/models';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      mount: typeof mount;
      stub: (obj: any, method: string) => Chainable<Subject>;
      spy: (obj: any, method: string) => Chainable<Subject>;
      state: (key: string) => any;
      returns: (value: any) => Chainable<Subject>;
    }
  }
}

describe('ClaimFormComponent', () => {
  const mockClaim = {
    id: '1',
    type: ClaimType.PROFESSIONAL,
    patientId: 'P123',
    dateOfService: new Date('2024-07-17'),
    totalAmount: 1500.50
  };

  const mockCreateRequest = {
    type: ClaimType.PROFESSIONAL,
    patientId: 'P123',
    dateOfService: new Date('2024-07-17'),
    totalAmount: 1500.50
  };

  const mockUpdateRequest = {
    patientId: 'P123',
    dateOfService: new Date('2024-07-17'),
    totalAmount: 1500.50
  };

  context('Create Mode', () => {
    beforeEach(() => {
      // Create stubs for services
      cy.stub(ClaimsService.prototype, 'createClaim')
        .as('createClaim')
        .returns(of({ success: true }));

      // Mount component with dependencies
      cy.mount<ClaimFormComponent>(ClaimFormComponent, {
        imports: [BrowserAnimationsModule],
        providers: [
          ClaimsService,
          { 
            provide: ActivatedRoute, 
            useValue: { snapshot: { paramMap: { get: () => null } } }
          },
          { provide: MatSnackBar, useValue: { open: cy.stub().as('snackBar') } }
        ]
      });
    });

    it('should create', () => {
      cy.get('app-claim-form').should('exist');
      cy.contains('New Claim').should('exist');
    });

    it('should display empty form with required fields', () => {
      // Check form fields exist
      cy.get('mat-select[formControlName="type"]').should('exist');
      cy.get('input[formControlName="patientId"]').should('exist');
      cy.get('input[formControlName="dateOfService"]').should('exist');
      cy.get('input[formControlName="totalAmount"]').should('exist');

      // Check submit button is disabled initially
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should show validation errors for empty fields', () => {
      // Try to submit empty form
      cy.get('button[type="submit"]').click();

      // Check error messages
      cy.contains('Claim type is required').should('exist');
      cy.contains('Patient ID is required').should('exist');
      cy.contains('Date of service is required').should('exist');
      cy.contains('Total amount is required').should('exist');
    });

    it('should show validation error for negative amount', () => {
      cy.get('input[formControlName="totalAmount"]').type('-100');
      cy.contains('Total amount must be greater than 0').should('exist');
    });

    it('should successfully create a claim', () => {
      const routerSpy = cy.spy(cy.state('window').router, 'navigate');

      // Fill form
      cy.get('mat-select[formControlName="type"]').click();
      cy.get('mat-option').contains('Professional').click();
      cy.get('input[formControlName="patientId"]').type('P123');
      cy.get('input[formControlName="dateOfService"]').type('2024-07-17');
      cy.get('input[formControlName="totalAmount"]').type('1500.50');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify service call
      cy.get('@createClaim').should('have.been.calledWith', mockCreateRequest);
      cy.get('@snackBar').should('have.been.called');
      cy.wrap(routerSpy).should('have.been.calledWith', ['/claims']);
    });

    it('should handle create error', () => {
      cy.stub(ClaimsService.prototype, 'createClaim')
        .returns(throwError(() => new Error('Create failed')));

      // Fill form
      cy.get('mat-select[formControlName="type"]').click();
      cy.get('mat-option').contains('Professional').click();
      cy.get('input[formControlName="patientId"]').type('P123');
      cy.get('input[formControlName="dateOfService"]').type('2024-07-17');
      cy.get('input[formControlName="totalAmount"]').type('1500.50');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify error handling
      cy.get('@snackBar').should('have.been.calledWith', 'Error creating claim', 'Close');
    });

    it('should navigate back on cancel', () => {
      const routerSpy = cy.spy(cy.state('window').router, 'navigate');
      cy.contains('button', 'Cancel').click();
      cy.wrap(routerSpy).should('have.been.calledWith', ['/claims']);
    });
  });

  context('Edit Mode', () => {
    beforeEach(() => {
      // Create stubs for services
      cy.stub(ClaimsService.prototype, 'getClaimById')
        .as('getClaimById')
        .returns(of(mockClaim));

      cy.stub(ClaimsService.prototype, 'updateClaim')
        .as('updateClaim')
        .returns(of({ success: true }));

      // Mount component with dependencies
      cy.mount<ClaimFormComponent>(ClaimFormComponent, {
        imports: [BrowserAnimationsModule],
        providers: [
          ClaimsService,
          { 
            provide: ActivatedRoute, 
            useValue: { snapshot: { paramMap: { get: () => '1' } } }
          },
          { provide: MatSnackBar, useValue: { open: cy.stub().as('snackBar') } }
        ]
      });
    });

    it('should load existing claim data', () => {
      cy.get('@getClaimById').should('have.been.calledWith', '1');
      
      // Verify form values
      cy.get('mat-select[formControlName="type"]').should('contain.text', 'Professional');
      cy.get('input[formControlName="patientId"]').should('have.value', 'P123');
      cy.get('input[formControlName="dateOfService"]').should('have.value', '7/17/2024');
      cy.get('input[formControlName="totalAmount"]').should('have.value', '1500.5');
    });

    it('should handle load error', () => {
      cy.stub(ClaimsService.prototype, 'getClaimById')
        .returns(throwError(() => new Error('Load failed')));

      // Remount to trigger error
      cy.mount<ClaimFormComponent>(ClaimFormComponent, {
        imports: [BrowserAnimationsModule],
        providers: [
          ClaimsService,
          { 
            provide: ActivatedRoute, 
            useValue: { snapshot: { paramMap: { get: () => '1' } } }
          },
          { provide: MatSnackBar, useValue: { open: cy.stub().as('snackBar') } }
        ]
      });

      cy.get('@snackBar').should('have.been.calledWith', 'Error loading claim', 'Close');
    });

    it('should successfully update a claim', () => {
      const routerSpy = cy.spy(cy.state('window').router, 'navigate');

      // Modify form
      cy.get('input[formControlName="totalAmount"]').clear().type('2000');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify service call
      cy.get('@updateClaim').should('have.been.calledWith', '1', {
        ...mockUpdateRequest,
        totalAmount: 2000
      });
      cy.get('@snackBar').should('have.been.called');
      cy.wrap(routerSpy).should('have.been.calledWith', ['/claims']);
    });

    it('should handle update error', () => {
      cy.stub(ClaimsService.prototype, 'updateClaim')
        .returns(throwError(() => new Error('Update failed')));

      // Submit form without changes
      cy.get('button[type="submit"]').click();

      // Verify error handling
      cy.get('@snackBar').should('have.been.calledWith', 'Error updating claim', 'Close');
    });
  });
}); 