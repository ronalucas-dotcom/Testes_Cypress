Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`)
})

Cypress.Commands.add('preencherLogin', (email, senha) => {
  cy.getByTestId('login-email-input').clear().type(email, { log: false })
  cy.getByTestId('login-password-input').clear().type(senha, { log: false })
})

Cypress.Commands.add('enviarLogin', () => {
  cy.getByTestId('login-submit-button').click()
})
