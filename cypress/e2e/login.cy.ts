/// <reference types="cypress" />

describe('Login Page', () => {
  beforeEach(() => {
    // Intercept the login API call
    cy.intercept('POST', '**/auth/login', (req) => {
      if (req.body.email === 'test@example.com' && req.body.password === 'password123') {
        req.reply({
          statusCode: 200,
          body: {
            message: 'Login successful',
            user: {
              id: '1',
              email: 'test@example.com',
              name: 'Test User',
              role: 'super_admin',
              isActive: true
            },
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          }
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {
            message: 'Invalid credentials'
          }
        });
      }
    }).as('loginRequest');

    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('[data-testid="login-form"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@loginRequest');
    cy.get('[data-testid="error-message"]').should('be.visible').and('contain', 'Invalid credentials');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
  });
}); 