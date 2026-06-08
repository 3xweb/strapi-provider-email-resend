"use strict";

const { Resend } = require("resend");

/**
 * Resend Email Provider for Strapi.
 *
 * This provider implements the interface expected by the
 * Strapi Email plugin and uses the official Resend SDK
 * to send emails.
 *
 * Expected configuration:
 *
 * providerOptions: {
 *   apiKey: "re_xxxxxxxxx"
 * }
 *
 * settings: {
 *   defaultFrom: "My App <noreply@example.com>",
 *   defaultReplyTo: "support@example.com"
 * }
 */
module.exports = {
  /**
   * Internal provider identifier.
   */
  provider: "resend",

  /**
   * Human-readable provider name.
   */
  name: "Resend",

  /**
   * Initializes the provider.
   *
   * Called once during the Strapi bootstrap process.
   *
   * @param {Object} providerOptions
   * @param {string} providerOptions.apiKey - Resend API key.
   *
   * @param {Object} settings
   * @param {string} settings.defaultFrom - Default sender address.
   * @param {string} settings.defaultReplyTo - Default reply-to address.
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
       * Sends an email using the Resend API.
       *
       * Supported fields:
       * - from
       * - to
       * - cc
       * - bcc
       * - replyTo
       * - subject
       * - text
       * - html
       * - react
       * - template
       *
       * When `template` is provided, the provider forwards the
       * template payload directly to Resend and ignores content
       * fields such as `html`, `text`, and `react`.
       *
       * Example:
       *
       * template: {
       *   id: "welcome-email",
       *   variables: {
       *     name: "Jane Doe",
       *     signupDate: "2024-01-01",
       *     foo: "bar",
       *   }
       * }
       *
       * Any additional properties are forwarded directly to the
       * Resend SDK, allowing support for future Resend features
       * without requiring provider updates.
       *
       * @param {Object} options - Email options.
       * @returns {Promise<Object>}
       */
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
          react,
          template,
          ...rest
        } = options;

        const payload = {
          from: from || settings.defaultFrom,
          to,
          cc,
          bcc,
          replyTo: replyTo || settings.defaultReplyTo,
          subject,
          ...rest,
        };

        if (template) {
          payload.template = template;
        } else {
          payload.text = text;
          payload.html = html;
          payload.react = react;
        }

        return resend.emails.send(payload);
      },
    };
  },
};
