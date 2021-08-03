/// <reference types='Cypress' />

context("Example page", () => {
    before(() => {
        cy.login("admin");
        cy.visit("#/for");
    });
});
