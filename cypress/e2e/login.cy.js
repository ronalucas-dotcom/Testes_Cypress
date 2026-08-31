const ids = {
  email: 'login-email-input',
  senha: 'login-password-input',
  mostrarSenha: 'login-password-input-toggle',
  entrar: 'login-submit-button',
}

const credenciais = {
  email: Cypress.env('TEST_USER_EMAIL'),
  senha: Cypress.env('TEST_USER_PASSWORD'),
}

const possuiCredenciais = Boolean(credenciais.email && credenciais.senha)
const testeComCredenciais = possuiCredenciais ? it : it.skip
const inverterCaixa = (texto) => [...texto]
  .map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())
  .join('')

describe('Plano de testes - Login Veritas', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.getByTestId(ids.email).should('be.visible')
    cy.getByTestId(ids.senha).should('be.visible')
  })

  context('Validação dos campos', () => {
    it('CT04 - impede login com e-mail vazio', () => {
      cy.getByTestId(ids.senha).type('SenhaQualquer!123', { log: false })
      cy.getByTestId(ids.entrar).should('be.disabled')
    })

    it('CT05 - impede login com senha vazia', () => {
      cy.getByTestId(ids.email).type('usuario@teste.com')
      cy.getByTestId(ids.entrar).should('be.disabled')
    })

    it('CT06 - impede login com todos os campos vazios', () => {
      cy.getByTestId(ids.email).should('have.value', '')
      cy.getByTestId(ids.senha).should('have.value', '')
      cy.getByTestId(ids.entrar).should('be.disabled')
    })

    it('CT07 - rejeita formato de e-mail inválido', () => {
      cy.getByTestId(ids.email).type('usuario@').then(($input) => {
        expect($input[0].checkValidity()).to.eq(false)
      })
    })

    it('CT14 - alterna a senha entre oculta e visível', () => {
      cy.getByTestId(ids.senha).type('Segredo!123', { log: false }).should('have.attr', 'type', 'password')
      cy.getByTestId(ids.mostrarSenha).click()
      cy.getByTestId(ids.senha).should('have.attr', 'type', 'text')
      cy.getByTestId(ids.mostrarSenha).click()
      cy.getByTestId(ids.senha).should('have.attr', 'type', 'password')
    })

    it('CT15 - mantém a senha mascarada por padrão', () => {
      cy.getByTestId(ids.senha).should('have.attr', 'type', 'password')
    })

    it('CT29 - habilita Entrar somente após preencher os dois campos', () => {
      cy.getByTestId(ids.entrar).should('be.disabled')
      cy.getByTestId(ids.email).type('usuario@teste.com')
      cy.getByTestId(ids.entrar).should('be.disabled')
      cy.getByTestId(ids.senha).type('SenhaQualquer!123', { log: false })
      cy.getByTestId(ids.entrar).should('be.enabled')
    })
  })

  context('Tentativas sem credenciais reais', () => {
    it('CT03 - nega usuário inexistente sem sair da tela', () => {
      cy.preencherLogin('nao-existe-cypress@example.invalid', 'SenhaInvalida!123')
      cy.enviarLogin()
      cy.get('[role="alert"]').should('be.visible')
      cy.location('pathname').should('eq', '/')
    })

    it('CT13 - envia o formulário pressionando Enter', () => {
      cy.preencherLogin('nao-existe-enter@example.invalid', 'SenhaInvalida!123')
      cy.getByTestId(ids.senha).type('{enter}')
      cy.get('[role="alert"]').should('be.visible')
      cy.location('pathname').should('eq', '/')
    })

    it('CT23 - trata caracteres especiais como dados', () => {
      cy.preencherLogin(`teste'\"<>;--@example.invalid`, `'<>';--`)
      cy.getByTestId(ids.email).then(($input) => {
        expect($input[0].checkValidity()).to.eq(false)
      })
      cy.getByTestId(ids.senha).should('have.value', `'<>';--`)
      cy.location('origin').should('eq', 'https://veritas.lasicifce.com.br')
    })

    it('CT24 - rejeita tentativa de SQL injection', () => {
      cy.preencherLogin("' OR '1'='1@example.invalid", "' OR '1'='1")
      cy.enviarLogin()
      cy.get('[role="alert"]').should('be.visible')
      cy.location('pathname').should('eq', '/')
    })

    it('CT25 - não executa conteúdo XSS', () => {
      cy.on('window:alert', () => {
        throw new Error('A aplicação executou JavaScript inserido pelo usuário')
      })
      cy.preencherLogin('xss@example.invalid', '<script>alert(1)</script>')
      cy.enviarLogin()
      cy.get('[role="alert"]').should('be.visible')
    })

    it('CT26 - nunca inclui a senha na URL', () => {
      const senha = 'SenhaQueNaoPodeVazar!123'
      cy.preencherLogin('url-check@example.invalid', senha)
      cy.enviarLogin()
      cy.url().should('not.include', encodeURIComponent(senha)).and('not.include', senha)
    })

    it('CT27 - utiliza HTTPS', () => {
      cy.location('protocol').should('eq', 'https:')
    })

    it('CT28 - usa mensagem genérica para usuário inexistente', () => {
      cy.preencherLogin('enumeracao@example.invalid', 'SenhaInvalida!123')
      cy.enviarLogin()
      cy.get('[role="alert"]').should('be.visible').invoke('text')
        .should('not.match', /usu[aá]rio\s+(?:n[aã]o\s+)?(?:existe|encontrado)|e-?mail\s+(?:n[aã]o\s+)?cadastrado/i)
    })
  })

  context('Cenários que exigem usuário de teste', () => {
    testeComCredenciais('CT01 - autentica com credenciais válidas', () => {
      cy.preencherLogin(credenciais.email, credenciais.senha)
      cy.enviarLogin()
      cy.location('pathname').should('not.eq', '/')
    })

    testeComCredenciais('CT02 - rejeita senha incorreta', () => {
      cy.preencherLogin(credenciais.email, `${credenciais.senha}-incorreta`)
      cy.enviarLogin()
      cy.get('[role="alert"]').should('be.visible')
    })

    testeComCredenciais('CT08 - trata espaços externos no e-mail', () => {
      cy.preencherLogin(` ${credenciais.email} `, credenciais.senha)
      cy.enviarLogin()
      cy.location('pathname').should('not.eq', '/')
    })

    testeComCredenciais('CT10 - ignora caixa do e-mail', () => {
      cy.preencherLogin(credenciais.email.toUpperCase(), credenciais.senha)
      cy.enviarLogin()
      cy.location('pathname').should('not.eq', '/')
    })

    testeComCredenciais('CT11 - diferencia caixa da senha', () => {
      cy.preencherLogin(credenciais.email, inverterCaixa(credenciais.senha))
      cy.enviarLogin()
      cy.get('[role="alert"]').should('be.visible')
    })
  })

  context('Proteção contra várias tentativas', () => {
    const testeProtecao = Cypress.env('ENABLE_RATE_LIMIT_TEST') ? it : it.skip

    testeProtecao('CT16 - aplica a política de proteção', () => {
      const tentativas = Number(Cypress.env('RATE_LIMIT_ATTEMPTS') || 5)
      Cypress._.times(tentativas, (indice) => {
        cy.visit('/')
        cy.preencherLogin('rate-limit@example.invalid', `Invalida-${indice}!`)
        cy.enviarLogin()
        cy.get('[role="alert"]').should('be.visible')
      })
      cy.get('body').invoke('text').should('match', /bloque|tentativa|captcha|aguarde|limite/i)
    })
  })
})
