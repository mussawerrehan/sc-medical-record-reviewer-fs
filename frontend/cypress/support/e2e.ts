// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add network commands
declare global {
  namespace Cypress {
    interface Chainable {
      intercept(method: string, url: string): Chainable<any>;
      wait(alias: string): Chainable<any>;
    }
  }
}

// Configure Cypress
Cypress.on('uncaught:exception', (_err: Error, _runnable: Mocha.Runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});
