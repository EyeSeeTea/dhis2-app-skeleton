/// <reference types='Cypress' />

context("Example page", () => {
    before(() => {
        cy.login("admin");
        cy.visit("/");
    });

    it("should contain sections", () => {
        cy.contains("Section");
    });
});
