describe('Payment Flow', () => {
  it('should complete checkout with COD', () => {
    cy.visit('/checkout');
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('textarea[name="address"]').type('123 Test St, Cypress, CA 90210');