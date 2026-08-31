# Testes Cypress - Login Veritas

Suíte E2E baseada no plano de testes de login da aplicação [Veritas](https://veritas.lasicifce.com.br).

## Instalação e execução

```bash
npm install
npm run cy:open
```

Para executar em modo headless: `npm test`.

## Configuração opcional

Copie `cypress.env.example.json` para `cypress.env.json` e preencha apenas os valores disponíveis. O arquivo real é ignorado pelo Git.

- Sem credenciais, a suíte executa validações de campos, interface e cenários negativos seguros.
- `TEST_USER_EMAIL` e `TEST_USER_PASSWORD` habilitam testes dependentes de autenticação.
- CT31-CT36 exigem a URL da API e o nome exato do header do código de verificação.
- CT16 fica ignorado por padrão, pois dispara várias tentativas inválidas.

## Cobertura

1. Executáveis sem credenciais: CT03-CT07, CT13-CT15, CT23-CT29.
2. Condicionais a credenciais/configuração: CT01, CT02, CT08, CT10, CT11 e CT31-CT36.
3. Dependentes de regras, usuários ou rotas ainda desconhecidas: CT09, CT12 e CT17-CT22.

Os casos de sessão serão implementados quando houver uma rota protegida e uma forma autorizada de autenticação. O CT12 também exige um usuário inativo ou bloqueado.
