"use strict";

const { Resend } = require("resend");

/**
 * Strapi Email Provider - Resend
 *
 * Este provider implementa a interface esperada pelo plugin Email
 * do Strapi e utiliza a API oficial da Resend para envio de mensagens.
 *
 * Configuração esperada:
 *
 * providerOptions: {
 *   apiKey: "re_xxxxxxxxx"
 * }
 *
 * settings: {
 *   defaultFrom: "Stara <noreply@staraapp.com.br>",
 *   defaultReplyTo: "suporte@staraapp.com.br"
 * }
 */
module.exports = {
  /**
   * Nome interno do provider.
   */
  provider: "resend",

  /**
   * Nome exibido pelo Strapi.
   */
  name: "Resend",

  /**
   * Inicializa o provider.
   *
   * Executado uma única vez durante o bootstrap da aplicação.
   *
   * @param {Object} providerOptions
   * @param {string} providerOptions.apiKey
   *
   * @param {Object} settings
   * @param {string} settings.defaultFrom
   * @param {string} settings.defaultReplyTo
   *
   * @returns {{ send: Function }}
   */
  init(providerOptions, settings) {
    if (!providerOptions?.apiKey) {
      throw new Error(
        "Missing Resend API key. Please configure providerOptions.apiKey.",
      );
    }
    
    const resend = new Resend(providerOptions.apiKey);

    return {
      /**
       * Envia um e-mail utilizando a API da Resend.
       *
       * Campos suportados:
       * - from
       * - to
       * - cc
       * - bcc
       * - replyTo
       * - subject
       * - text
       * - html
       *
       * Qualquer propriedade adicional é encaminhada
       * diretamente para o SDK da Resend.
       *
       * @param {Object} options
       * @returns {Promise<Object>}
       */
      async send(options) {
        const { from, to, cc, bcc, replyTo, subject, text, html, ...rest } =
          options;

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
