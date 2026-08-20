    cy.visit('/checkout');
    cy.get('input[name="fullName"]').type('Test User');
    cy.get('textarea[name="address"]').type('123 Test St, Cypress, CA 90210');
    cy.contains('เก็บเงินปลายทาง (COD)').click();
    cy.get('button[type="button"]').should('exist');
    cy.contains('ยืนยันคำสั่งซื้อ').should('exist');
  });
});
