describe('Providers Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-cy=username-input]').type('admin@example.com');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    
    // Navigate to providers page
    cy.get('[data-cy=providers-nav]').click();
    cy.url().should('include', '/providers');
  });

  it('should display providers list', () => {
    cy.get('[data-cy=providers-table]').should('be.visible');
    cy.get('[data-cy=provider-row]').should('have.length.at.least', 1);
  });

  it('should search providers', () => {
    const searchTerm = 'Dr.';
    cy.get('[data-cy=search-input]').type(searchTerm);
    cy.get('[data-cy=provider-row]').each(($row) => {
      cy.wrap($row).should('contain', searchTerm);
    });
  });

  it('should filter providers by specialty', () => {
    cy.get('[data-cy=specialty-filter]').click();
    cy.get('[data-cy=specialty-option]').first().click();
    cy.get('[data-cy=apply-filters]').click();
    
    // Verify filtered results
    cy.get('[data-cy=provider-row]').should('have.length.at.least', 1);
  });

  it('should create new provider', () => {
    cy.get('[data-cy=new-provider-btn]').click();
    
    // Fill provider form
    cy.get('[data-cy=provider-name]').type('Dr. Test Provider');
    cy.get('[data-cy=provider-npi]').type('1234567890');
    cy.get('[data-cy=provider-specialty]').click();
    cy.get('[data-cy=specialty-option]').first().click();
    cy.get('[data-cy=provider-address]').type('456 Medical Drive');
    cy.get('[data-cy=provider-city]').type('Test City');
    cy.get('[data-cy=provider-state]').type('TS');
    cy.get('[data-cy=provider-zip]').type('12345');
    cy.get('[data-cy=provider-phone]').type('1234567890');
    cy.get('[data-cy=provider-email]').type('doctor@testprovider.com');
    
    // Submit form
    cy.get('[data-cy=submit-provider]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Provider created successfully');
  });

  it('should view provider details', () => {
    cy.get('[data-cy=provider-row]').first().click();
    cy.url().should('include', '/providers/');
    cy.get('[data-cy=provider-details]').should('be.visible');
    cy.get('[data-cy=provider-id]').should('be.visible');
    cy.get('[data-cy=provider-name]').should('be.visible');
    cy.get('[data-cy=provider-npi]').should('be.visible');
  });

  it('should edit existing provider', () => {
    // Open first provider
    cy.get('[data-cy=provider-row]').first().click();
    
    // Click edit
    cy.get('[data-cy=edit-provider]').click();
    
    // Modify details
    cy.get('[data-cy=provider-phone]').clear().type('9876543210');
    cy.get('[data-cy=provider-email]').clear().type('newemail@testprovider.com');
    
    // Save changes
    cy.get('[data-cy=save-provider]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Provider updated successfully');
  });

  it('should view provider claims history', () => {
    // Open first provider
    cy.get('[data-cy=provider-row]').first().click();
    
    // Go to claims tab
    cy.get('[data-cy=claims-tab]').click();
    
    // Verify claims list
    cy.get('[data-cy=provider-claims]').should('be.visible');
    cy.get('[data-cy=claim-row]').should('have.length.at.least', 1);
  });

  it('should manage associated hospitals', () => {
    // Open first provider
    cy.get('[data-cy=provider-row]').first().click();
    
    // Go to hospitals tab
    cy.get('[data-cy=hospitals-tab]').click();
    
    // Add new hospital affiliation
    cy.get('[data-cy=add-hospital-btn]').click();
    cy.get('[data-cy=hospital-search]').type('General');
    cy.get('[data-cy=hospital-option]').first().click();
    cy.get('[data-cy=confirm-add-hospital]').click();
    
    // Verify hospital added
    cy.get('[data-cy=hospital-list]')
      .should('contain', 'General');
  });

  it('should delete provider', () => {
    // Get initial count
    cy.get('[data-cy=provider-row]').then(($rows) => {
      const initialCount = $rows.length;
      
      // Delete first provider
      cy.get('[data-cy=provider-row]').first().find('[data-cy=delete-provider]').click();
      cy.get('[data-cy=confirm-delete]').click();
      
      // Verify count decreased
      cy.get('[data-cy=provider-row]').should('have.length', initialCount - 1);
      
      // Verify success message
      cy.get('[data-cy=success-message]')
        .should('be.visible')
        .and('contain', 'Provider deleted successfully');
    });
  });
}); 