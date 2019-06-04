// https://docs.cypress.io/api/introduction/api.html

xdescribe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/');
    cy.get('#app .spinner > img').should('be.visible');
  })
});
