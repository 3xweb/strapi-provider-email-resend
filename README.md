# Resend Email Provider for Strapi v5

[![npm version](https://img.shields.io/npm/v/@3xweb/strapi-provider-email-resend)](https://www.npmjs.com/package/@3xweb/strapi-provider-email-resend)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A lightweight email provider for Strapi v5 powered by the official Resend SDK.

## Features

* Compatible with Strapi v5
* Uses the official Resend SDK
* Supports HTML and plain text emails
* Supports Resend Templates
* Supports CC, BCC and Reply-To
* Passes through additional Resend options
* No build step required
* Node.js 18+

## Requirements

* Node.js 18 or later
* Strapi v5
* A Resend account and API key

## Installation

```bash
npm install @3xweb/strapi-provider-email-resend
```

## Configuration

Create or update `config/plugins.ts`:

```ts
export default ({ env }) => ({
  email: {
    config: {
      provider: "@3xweb/strapi-provider-email-resend",

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

## Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

EMAIL_FROM=My App <noreply@example.com>
EMAIL_REPLY_TO=support@example.com
```

## Usage

### HTML email

```js
await strapi.plugins.email.services.email.send({
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Hello!</h1><p>Your account has been created.</p>",
});
```

### Plain text email

```js
await strapi.plugins.email.services.email.send({
  to: "user@example.com",
  subject: "Welcome",
  text: "Hello! Your account has been created.",
});
```

### Resend Template

```js
await strapi.plugins.email.services.email.send({
  to: "user@example.com",
  subject: "Welcome",
  template: {
    id: "welcome-email",
    variables: {
      name: "Douglas",
      loginUrl: "https://example.com/login",
    },
  },
});
```

When using `template`, the provider sends only the template payload to Resend and does not include `html` or `text`.

## Supported Fields

| Field    | Description                   |
| -------- | ----------------------------- |
| from     | Email sender                  |
| to       | Recipient or recipients       |
| cc       | Carbon copy recipients        |
| bcc      | Blind carbon copy recipients  |
| replyTo  | Reply-to address              |
| subject  | Email subject                 |
| text     | Plain text content            |
| html     | HTML content                  |
| template | Resend Template configuration |

Any additional properties provided by Strapi are forwarded directly to the Resend SDK.

## Default Behavior

If `from` is not provided, the provider uses `settings.defaultFrom`.

If `replyTo` is not provided, the provider uses `settings.defaultReplyTo`.

A single Resend client instance is created during Strapi startup and reused for all email requests.

Errors returned by the Resend API are propagated to Strapi, allowing normal logging and error handling.

## Notes

This provider supports both standard Strapi email templates and Resend Templates.

For Strapi built-in emails, such as password reset and email confirmation, Strapi usually generates the `html` or `text` content internally and sends it through the configured email provider.

Resend Templates are useful for custom application emails where you want the template content to live inside Resend.

## License

MIT

## Notes
Originally based on the strapi-provider-email-resend project by Jerod Fritz, updated for Strapi v5 and the latest Resend SDK.
