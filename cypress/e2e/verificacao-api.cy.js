const api = {
  url: Cypress.env('VERIFICATION_API_URL'),
  header: Cypress.env('VERIFICATION_HEADER_NAME'),
  codigoValido: Cypress.env('VERIFICATION_VALID_CODE'),
  codigoInvalido: Cypress.env('VERIFICATION_INVALID_CODE') || 'codigo-invalido-cypress',
  codigoExpirado: Cypress.env('VERIFICATION_EXPIRED_CODE'),
  method: Cypress.env('VERIFICATION_API_METHOD') || 'POST',
  body: Cypress.env('VERIFICATION_API_BODY') || {},
}

const possuiApi = Boolean(api.url && api.header)
const testeApi = possuiApi ? it : it.skip

const solicitar = (codigo, body = api.body) => cy.request({
  method: api.method,
  url: api.url,
  headers: codigo ? { [api.header]: codigo } : {},
  body,
  failOnStatusCode: false,
})

describe('Código de verificação no header', () => {
  testeApi('CT32 - rejeita ausência do header', () => {
    solicitar().its('status').should('be.oneOf', [400, 401, 403, 422])
  })

  testeApi('CT33 - rejeita código inválido no header', () => {
    solicitar(api.codigoInvalido).its('status').should('be.oneOf', [400, 401, 403, 422])
  })

  ;(possuiApi && api.codigoValido ? it : it.skip)('CT31 - aceita código válido no header', () => {
    solicitar(api.codigoValido).its('status').should('be.within', 200, 299)
  })

  ;(possuiApi && api.codigoExpirado ? it : it.skip)('CT34 - rejeita código expirado', () => {
    solicitar(api.codigoExpirado).its('status').should('be.oneOf', [400, 401, 403, 410, 422])
  })

  ;(possuiApi && api.codigoValido ? it : it.skip)('CT35 - rejeita reutilização de código de uso único', () => {
    solicitar(api.codigoValido).its('status').should('be.within', 200, 299)
    solicitar(api.codigoValido).its('status').should('be.oneOf', [400, 401, 403, 409, 410, 422])
  })

  testeApi('CT36 - não aceita o código fora do header', () => {
    solicitar(undefined, { ...api.body, verificationCode: api.codigoInvalido })
      .its('status').should('be.oneOf', [400, 401, 403, 422])
  })
})
