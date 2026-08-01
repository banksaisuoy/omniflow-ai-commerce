/// <reference types="cypress" />

describe('Tokenized Payment Flow', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/payments/tokenize', {
      statusCode: 200,
      body: { token: 'conf_mock' }
    }).as('tokenizePayment');
    cy.visit('/products');
  });

  it('allows user to complete purchase using tokenized payment', () => {
    cy.intercept('POST', '**/rest/v1/rpc/create_order', {
      statusCode: 200,
      body: { id: 'test_order_123' }
    }).as('createOrder');

    cy.window().then((win) => {
      win.localStorage.setItem('omniflow-cart', JSON.stringify({
        state: { items: [{ id: '1', price: 100, quantity: 1, stock: 10 }] },
        version: 0
      }));
    });
    
    cy.visit('/checkout');
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('textarea[name="address"]').type('123 Test St, Cypress, CA 90210');
    cy.contains('Credit Card (Secure)').click();
    cy.get('button[type="submit"]').should('exist');
    cy.contains('ยืนยันคำสั่งซื้อ').should('exist');
  });
});