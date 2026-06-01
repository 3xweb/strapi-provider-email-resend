# Strapi Email Provider - Resend

Provider de e-mail para Strapi utilizando a API da Resend.

## Compatibilidade

* Strapi v5
* Node.js 18+
* Resend SDK 6.x

## Instalação

```bash
npm install resend
```

ou, se estiver utilizando este provider como pacote:

```bash
npm install @stara/strapi-provider-email-resend
```

## Configuração do Strapi

Arquivo `config/plugins.ts`:

```ts
export default ({ env }) => ({
  email: {
    config: {
      provider: "@stara/strapi-provider-email-resend",

      providerOptions: {
        apiKey: env("RESEND_API_KEY"),
      },

      settings: {
        defaultFrom: env("EMAIL_FROM"),
        defaultReplyTo: env("EMAIL_REPLY_TO"),
      },
    },
  },
});
```

## Variáveis de Ambiente

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

EMAIL_FROM=Stara <noreply@staraapp.com.br>
EMAIL_REPLY_TO=suporte@staraapp.com.br
```

## Implementação

```js
"use strict";

const { Resend } = require("resend");

module.exports = {
  provider: "resend",
  name: "Resend",

  init(providerOptions, settings) {
    const resend = new Resend(providerOptions.apiKey);

    return {
      async send(options) {
        const {
          from,
          to,
          cc,
          bcc,
          replyTo,
          subject,
          text,
          html,
          ...rest
        } = options;

        return resend.emails.send({
          from: from || settings.defaultFrom,
          to,
          cc,
          bcc,
          replyTo: replyTo || settings.defaultReplyTo,
          subject,
          text,
          html,
          ...rest,
        });
      },
    };
  },
};
```

## Campos Suportados

| Campo   | Descrição            |
| ------- | -------------------- |
| from    | Remetente do e-mail  |
| to      | Destinatário(s)      |
| cc      | Cópia                |
| bcc     | Cópia oculta         |
| replyTo | Endereço de resposta |
| subject | Assunto              |
| text    | Conteúdo texto puro  |
| html    | Conteúdo HTML        |

Qualquer campo adicional enviado pelo Strapi será repassado para a API da Resend através de `...rest`.

## Exemplo de Uso

```js
await strapi.plugins.email.services.email.send({
  to: "usuario@email.com",
  subject: "Bem-vindo",
  html: "<h1>Olá!</h1><p>Sua conta foi criada com sucesso.</p>",
});
```

## Comportamento

* Caso `from` não seja informado, será utilizado `settings.defaultFrom`.
* Caso `replyTo` não seja informado, será utilizado `settings.defaultReplyTo`.
* O provider utiliza uma única instância do cliente Resend por inicialização.
* Os erros da API Resend são propagados para o Strapi para tratamento e logging.

## Segurança

Este provider utiliza o SDK oficial mais recente da Resend, evitando vulnerabilidades conhecidas presentes em versões antigas do pacote.

Recomenda-se manter a dependência sempre atualizada:

```bash
npm update resend
```
