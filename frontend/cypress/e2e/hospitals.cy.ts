describe('Hospitals Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-cy=username-input]').type('admin@example.com');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    
    // Navigate to hospitals page
    cy.get('[data-cy=hospitals-nav]').click();
    cy.url().should('include', '/hospitals');
  });

  it('should display hospitals list', () => {
    cy.get('[data-cy=hospitals-table]').should('be.visible');
    cy.get('[data-cy=hospital-row]').should('have.length.at.least', 1);
  });

  it('should search hospitals', () => {
    const searchTerm = 'General';
    cy.get('[data-cy=search-input]').type(searchTerm);
    cy.get('[data-cy=hospital-row]').each(($row) => {
      cy.wrap($row).should('contain', searchTerm);
    });
  });

  it('should create new hospital', () => {
    cy.get('[data-cy=new-hospital-btn]').click();
    
    // Fill hospital form
    cy.get('[data-cy=hospital-name]').type('Test General Hospital');
    cy.get('[data-cy=hospital-address]').type('123 Test Street');
    cy.get('[data-cy=hospital-city]').type('Test City');
    cy.get('[data-cy=hospital-state]').type('TS');
    cy.get('[data-cy=hospital-zip]').type('12345');
    cy.get('[data-cy=hospital-phone]').type('1234567890');
    cy.get('[data-cy=hospital-email]').type('contact@testgeneral.com');
    
    // Submit form
    cy.get('[data-cy=submit-hospital]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Hospital created successfully');
  });

  it('should view hospital details', () => {
    cy.get('[data-cy=hospital-row]').first().click();
    cy.url().should('include', '/hospitals/');
    cy.get('[data-cy=hospital-details]').should('be.visible');
    cy.get('[data-cy=hospital-id]').should('be.visible');
    cy.get('[data-cy=hospital-name]').should('be.visible');
    cy.get('[data-cy=hospital-contact]').should('be.visible');
  });

  it('should edit existing hospital', () => {
    // Open first hospital
    cy.get('[data-cy=hospital-row]').first().click();
    
    // Click edit
    cy.get('[data-cy=edit-hospital]').click();
    
    // Modify details
    cy.get('[data-cy=hospital-phone]').clear().type('9876543210');
    cy.get('[data-cy=hospital-email]').clear().type('newemail@testgeneral.com');
    
    // Save changes
    cy.get('[data-cy=save-hospital]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Hospital updated successfully');
  });

  it('should manage associated providers', () => {
    // Open first hospital
    cy.get('[data-cy=hospital-row]').first().click();
    
    // Go to providers tab
    cy.get('[data-cy=providers-tab]').click();
    
    // Add new provider
    cy.get('[data-cy=add-provider-btn]').click();
    cy.get('[data-cy=provider-search]').type('Test Provider');
    cy.get('[data-cy=provider-option]').first().click();
    cy.get('[data-cy=confirm-add-provider]').click();
    
    // Verify provider added
    cy.get('[data-cy=provider-list]')
      .should('contain', 'Test Provider');
  });

  it('should delete hospital', () => {
    // Get initial count
    cy.get('[data-cy=hospital-row]').then(($rows) => {
      const initialCount = $rows.length;
      
      // Delete first hospital
      cy.get('[data-cy=hospital-row]').first().find('[data-cy=delete-hospital]').click();
      cy.get('[data-cy=confirm-delete]').click();
      
      // Verify count decreased
      cy.get('[data-cy=hospital-row]').should('have.length', initialCount - 1);
      
      // Verify success message
      cy.get('[data-cy=success-message]')
        .should('be.visible')
        .and('contain', 'Hospital deleted successfully');
    });
  });
}); 