/// <reference types="cypress" />
import { mount } from 'cypress/angular';
import { ClaimDetailsComponent } from '../../src/app/components/claims/claim-details/claim-details.component';
import { ClaimsService } from '../../src/app/services/claims.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ClaimStatus, ClaimType } from '../../src/app/models';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      stub: (obj: any, method: string) => Chainable;
      spy: (obj: any, method: string) => Chainable;
      state: (key: string) => any;
    }
  }
}

const mockProfessionalClaim = {
  id: '1',
  type: ClaimType.PROFESSIONAL,
  status: ClaimStatus.DRAFT,
  patientId: 'P123',
  dateOfService: new Date('2024-07-17'),
  submissionDate: new Date('2024-07-17'),
  totalAmount: 1500.50,
  professionalClaim: {
    cptCodes: [
      { code: '99213', description: 'Office visit' }
    ],
    icd10Codes: [
      { code: 'J20.0', description: 'Acute bronchitis' }
    ]
  },
  validationErrors: [
    { message: 'Missing provider NPI' }
  ],
  processingHistory: [
    {
      date: new Date('2024-07-17'),
      status: 'Created',
      notes: 'Initial claim creation'
    }
  ]
};

const mockInstitutionalClaim = {
  id: '2',
  type: ClaimType.INSTITUTIONAL,
  status: ClaimStatus.SUBMITTED,
  patientId: 'P456',
  dateOfService: new Date('2024-07-16'),
  submissionDate: new Date('2024-07-16'),
  totalAmount: 2500.75,
  institutionalClaim: {
    admissionDate: new Date('2024-07-16'),
    dischargeDate: new Date('2024-07-17'),
    revenueCode: '0450',
    icd10BillingCodes: [
      { code: 'S06.0X0A', description: 'Concussion without loss of consciousness' }
    ]
  },
  processingHistory: [
    {
      date: new Date('2024-07-16'),
      status: 'Submitted',
      notes: 'Claim submitted for processing'
    }
  ]
};

const mockDrgClaim = {
  id: '3',
  type: ClaimType.DRG,
  status: ClaimStatus.DRAFT,
  patientId: 'P789',
  dateOfService: new Date('2024-07-15'),
  submissionDate: new Date('2024-07-15'),
  totalAmount: 5000.00,
  drgClaim: {
    drgCode: '470',
    drgDescription: 'Major Joint Replacement',
    expectedReimbursement: 4500.00,
    lengthOfStay: 3
  },
  processingHistory: [
    {
      date: new Date('2024-07-15'),
      status: 'Created',
      notes: 'Initial DRG claim creation'
    }
  ]
};

describe('ClaimDetailsComponent', () => {
  beforeEach(() => {
    // Create stubs for services
    cy.stub(ClaimsService.prototype, 'getClaim')
      .as('getClaim')
      .returns(of(mockProfessionalClaim));

    cy.stub(ClaimsService.prototype, 'deleteClaim')
      .as('deleteClaim')
      .returns(of({ success: true }));

    cy.stub(ClaimsService.prototype, 'submitClaim')
      .as('submitClaim')
      .returns(of({ success: true }));

    // Mock route params
    const activatedRouteStub = {
      paramMap: of(new Map([['id', '1']]))
    };

    // Mount component with dependencies
    cy.mount<ClaimDetailsComponent>(ClaimDetailsComponent, {
      imports: [BrowserAnimationsModule],
      providers: [
        ClaimsService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: MatSnackBar, useValue: { open: cy.stub().as('snackBar') } }
      ]
    });
  });

  it('should create', () => {
    cy.get('app-claim-details').should('exist');
  });

  it('should load and display professional claim details', () => {
    cy.get('@getClaim').should('have.been.called');
    
    // Check basic claim info
    cy.contains('Claim ID:').parent().contains('1');
    cy.contains('Patient ID:').parent().contains('P123');
    cy.contains('Total Amount:').parent().contains('$1,500.50');
    
    // Check type and status chips
    cy.get('mat-chip').first().should('contain.text', 'Professional')
      .and('have.class', 'mat-primary');
    cy.get('mat-chip').eq(1).should('contain.text', 'Draft');
    
    // Check professional claim specific details
    cy.contains('Professional Claim Details').should('exist');
    cy.contains('CPT 99213:').parent().contains('Office visit');
    cy.contains('ICD-10 J20.0:').parent().contains('Acute bronchitis');
  });

  it('should display validation errors', () => {
    cy.contains('Validation Errors').should('exist');
    cy.get('.validation-errors').within(() => {
      cy.get('.error').should('contain.text', 'Missing provider NPI');
      cy.get('mat-icon').should('have.attr', 'color', 'warn');
    });
  });

  it('should display processing history', () => {
    cy.contains('Processing History').should('exist');
    cy.get('.processing-history').within(() => {
      cy.get('.history-item').should('have.length', 1);
      cy.contains('Created');
      cy.contains('Initial claim creation');
    });
  });

  it('should handle claim deletion', () => {
    const routerSpy = cy.spy(cy.state('window').router, 'navigate');
    cy.get('button mat-icon').contains('delete').click();
    cy.get('@deleteClaim').should('have.been.calledWith', '1');
    cy.get('@snackBar').should('have.been.called');
    cy.wrap(routerSpy).should('have.been.calledWith', ['/claims']);
  });

  it('should handle claim submission', () => {
    cy.contains('button', 'Submit Claim').click();
    cy.get('@submitClaim').should('have.been.calledWith', '1');
    cy.get('@snackBar').should('have.been.called');
  });

  it('should navigate back when clicking back button', () => {
    const routerSpy = cy.spy(cy.state('window').router, 'navigate');
    cy.contains('button', 'Back').click();
    cy.wrap(routerSpy).should('have.been.calledWith', ['/claims']);
  });

  context('Institutional Claims', () => {
    beforeEach(() => {
      cy.stub(ClaimsService.prototype, 'getClaim')
        .as('getClaim')
        .returns(of(mockInstitutionalClaim));

      // Remount with institutional claim
      cy.mount<ClaimDetailsComponent>(ClaimDetailsComponent, {
        imports: [BrowserAnimationsModule],
        providers: [
          ClaimsService,
          { 
            provide: ActivatedRoute, 
            useValue: { paramMap: of(new Map([['id', '2']])) }
          },
          { provide: MatSnackBar, useValue: { open: cy.stub() } }
        ]
      });
    });

    it('should display institutional claim details', () => {
      cy.contains('Institutional Claim Details').should('exist');
      cy.contains('Admission Date:').parent().contains('Jul 16, 2024');
      cy.contains('Discharge Date:').parent().contains('Jul 17, 2024');
      cy.contains('Revenue Code:').parent().contains('0450');
      cy.contains('ICD-10 S06.0X0A:').parent()
        .contains('Concussion without loss of consciousness');
    });
  });

  context('DRG Claims', () => {
    beforeEach(() => {
      cy.stub(ClaimsService.prototype, 'getClaim')
        .as('getClaim')
        .returns(of(mockDrgClaim));

      // Remount with DRG claim
      cy.mount<ClaimDetailsComponent>(ClaimDetailsComponent, {
        imports: [BrowserAnimationsModule],
        providers: [
          ClaimsService,
          { 
            provide: ActivatedRoute, 
            useValue: { paramMap: of(new Map([['id', '3']])) }
          },
          { provide: MatSnackBar, useValue: { open: cy.stub() } }
        ]
      });
    });

    it('should display DRG claim details', () => {
      cy.contains('DRG Claim Details').should('exist');
      cy.contains('DRG Code:').parent().contains('470');
      cy.contains('DRG Description:').parent().contains('Major Joint Replacement');
      cy.contains('Expected Reimbursement:').parent().contains('$4,500.00');
      cy.contains('Length of Stay:').parent().contains('3 days');
    });
  });
}); 