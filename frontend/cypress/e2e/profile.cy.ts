describe('Profile Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('[data-cy=username-input]').type('admin@example.com');
    cy.get('[data-cy=password-input]').type('admin123');
    cy.get('[data-cy=login-button]').click();
    
    // Navigate to profile page
    cy.get('[data-cy=user-menu]').click();
    cy.get('[data-cy=profile-link]').click();
    cy.url().should('include', '/profile');
  });

  it('should display user profile information', () => {
    cy.get('[data-cy=profile-details]').should('be.visible');
    cy.get('[data-cy=user-name]').should('be.visible');
    cy.get('[data-cy=user-email]').should('be.visible');
    cy.get('[data-cy=user-role]').should('be.visible');
  });

  it('should update profile information', () => {
    cy.get('[data-cy=edit-profile]').click();
    
    // Update name
    cy.get('[data-cy=name-input]').clear().type('Updated Name');
    
    // Update phone
    cy.get('[data-cy=phone-input]').clear().type('9876543210');
    
    // Save changes
    cy.get('[data-cy=save-profile]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Profile updated successfully');
    
    // Verify updated information
    cy.get('[data-cy=user-name]').should('contain', 'Updated Name');
    cy.get('[data-cy=user-phone]').should('contain', '9876543210');
  });

  it('should change password', () => {
    cy.get('[data-cy=change-password]').click();
    
    // Fill password form
    cy.get('[data-cy=current-password]').type('admin123');
    cy.get('[data-cy=new-password]').type('newPassword123');
    cy.get('[data-cy=confirm-password]').type('newPassword123');
    
    // Submit form
    cy.get('[data-cy=submit-password]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Password updated successfully');
  });

  it('should show validation errors for password change', () => {
    cy.get('[data-cy=change-password]').click();
    
    // Test password mismatch
    cy.get('[data-cy=current-password]').type('admin123');
    cy.get('[data-cy=new-password]').type('newPassword123');
    cy.get('[data-cy=confirm-password]').type('differentPassword123');
    cy.get('[data-cy=submit-password]').click();
    
    cy.get('[data-cy=password-error]')
      .should('be.visible')
      .and('contain', 'Passwords do not match');
    
    // Test weak password
    cy.get('[data-cy=new-password]').clear().type('weak');
    cy.get('[data-cy=confirm-password]').clear().type('weak');
    cy.get('[data-cy=submit-password]').click();
    
    cy.get('[data-cy=password-error]')
      .should('be.visible')
      .and('contain', 'Password must be at least 8 characters');
  });

  it('should manage notification preferences', () => {
    cy.get('[data-cy=notification-settings]').click();
    
    // Toggle email notifications
    cy.get('[data-cy=email-notifications]').click();
    
    // Toggle specific notification types
    cy.get('[data-cy=claim-notifications]').click();
    cy.get('[data-cy=system-notifications]').click();
    
    // Save preferences
    cy.get('[data-cy=save-preferences]').click();
    
    // Verify success
    cy.get('[data-cy=success-message]')
      .should('be.visible')
      .and('contain', 'Preferences updated successfully');
  });

  it('should display activity history', () => {
    cy.get('[data-cy=activity-history]').click();
    
    // Verify activity list
    cy.get('[data-cy=activity-list]').should('be.visible');
    cy.get('[data-cy=activity-item]').should('have.length.at.least', 1);
    
    // Verify activity details
    cy.get('[data-cy=activity-item]').first().within(() => {
      cy.get('[data-cy=activity-date]').should('be.visible');
      cy.get('[data-cy=activity-type]').should('be.visible');
      cy.get('[data-cy=activity-description]').should('be.visible');
    });
  });
}); 