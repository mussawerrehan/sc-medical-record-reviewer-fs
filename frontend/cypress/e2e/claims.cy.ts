describe('Claims Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-cy=username-input]').type('admin@example.com');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    
    // Navigate to claims page
    cy.get('[data-cy=claims-nav]').click();
    cy.url().should('include', '/claims');
  });

  it('should display claims list', () => {
    cy.get('[data-cy=claims-table]').should('be.visible');
    cy.get('[data-cy=claims-row]').should('have.length.at.least', 1);
  });

  it('should filter claims', () => {
    // Test status filter
    cy.get('[data-cy=status-filter]').click();
    cy.get('[data-cy=status-option-pending]').click();
    cy.get('[data-cy=claims-row]').each(($row) => {
      cy.wrap($row).find('[data-cy=claim-status]').should('contain', 'Pending');
    });

    // Test date range filter
    cy.get('[data-cy=date-filter]').click();
    cy.get('[data-cy=date-range-last-30-days]').click();
    cy.get('[data-cy=apply-filters]').click();
  });

  it('should create new claim', () => {
    cy.get('[data-cy=new-claim-btn]').click();
    
    // Fill claim form
    cy.get('[data-cy=claim-type]').click();
    cy.get('[data-cy=claim-type-professional]').click();
    cy.get('[data-cy=provider-select]').type('Test Provider');
    cy.get('[data-cy=provider-option]').first().click();
    cy.get('[data-cy=diagnosis-code]').type('A00.0');
    cy.get('[data-cy=procedure-code]').type('99201');
    cy.get('[data-cy=claim-amount]').type('150.00');
    
    // Submit claim
    cy.get('[data-cy=submit-claim]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Claim created successfully');
  });

  it('should view claim details', () => {
    cy.get('[data-cy=claims-row]').first().click();
    cy.url().should('include', '/claims/');
    cy.get('[data-cy=claim-details]').should('be.visible');
    cy.get('[data-cy=claim-id]').should('be.visible');
    cy.get('[data-cy=claim-status]').should('be.visible');
    cy.get('[data-cy=claim-amount]').should('be.visible');
  });

  it('should edit existing claim', () => {
    // Open first claim
    cy.get('[data-cy=claims-row]').first().click();
    
    // Click edit
    cy.get('[data-cy=edit-claim]').click();
    
    // Modify amount
    cy.get('[data-cy=claim-amount]').clear().type('200.00');
    
    // Save changes
    cy.get('[data-cy=save-claim]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Claim updated successfully');
  });

  it('should delete claim', () => {
    // Get initial count
    cy.get('[data-cy=claims-row]').then(($rows) => {
      const initialCount = $rows.length;
      
      // Delete first claim
      cy.get('[data-cy=claims-row]').first().find('[data-cy=delete-claim]').click();
      cy.get('[data-cy=confirm-delete]').click();
      
      // Verify count decreased
      cy.get('[data-cy=claims-row]').should('have.length', initialCount - 1);
      
      // Verify success message
      cy.get('[data-cy=success-message]')
        .should('be.visible')
        .and('contain', 'Claim deleted successfully');
    });
  });
}); 