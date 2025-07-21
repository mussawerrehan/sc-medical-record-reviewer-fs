describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('[data-testid=login-form]').should('be.visible');
    cy.get('[data-testid=email-input]').should('be.visible');
    cy.get('[data-testid=password-input]').should('be.visible');
    cy.get('[data-testid=login-button]').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('[data-testid=login-button]').click();
    cy.get('mat-error').should('be.visible')
      .and('contain', 'Email is required');
    cy.get('mat-error').should('be.visible')
      .and('contain', 'Password is required');
  });

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '**/auth/login').as('loginRequest');
    
    cy.get('[data-testid=email-input]').type('invalid@example.com');
    cy.get('[data-testid=password-input]').type('wrongpassword');
    cy.get('[data-testid=login-button]').click();
    
    cy.wait('@loginRequest').then((interception) => {
      // Log the response
      cy.log('Login response:', interception.response?.body);
      
      // Check if any error message is displayed
      cy.get('mat-error').should('be.visible')
        .and('contain', 'Invalid credentials');
    });
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-testid=email-input]').type('admin@example.com');
    cy.get('[data-testid=password-input]').type('admin123');
    cy.get('[data-testid=login-button]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should maintain session after page reload', () => {
    // Login first
    cy.get('[data-testid=email-input]').type('admin@example.com');
    cy.get('[data-testid=password-input]').type('admin123');
    cy.get('[data-testid=login-button]').click();
    
    // Verify logged in state
    cy.url().should('include', '/dashboard');
    
    // Reload page
    cy.reload();
    
    // Should still be logged in
    cy.url().should('include', '/dashboard');
  });
}); 