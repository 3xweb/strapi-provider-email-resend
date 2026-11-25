"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const provider = require("../src");

const defaultFrom = "Example App <noreply@example.com>";
const defaultReplyTo = "support@example.com";
const recipient = "reader@example.com";

function mockSend(t, status, body) {
  const fetch = t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify(body), { status }),
  );
  const mail = provider.init(
    { apiKey: "re_fixture_only" },
    { defaultFrom, defaultReplyTo },
  );
  function payload() {
    assert.equal(fetch.mock.callCount(), 1);
    const [url, options] = fetch.mock.calls[0].arguments;
    assert.equal(new URL(url).pathname, "/emails");
    assert.equal(options.method, "POST");
    return JSON.parse(options.body);
  }
  return { mail, payload };
}

test("sends HTML and text with defaults and preserves the SDK response", async (t) => {
  const { mail, payload } = mockSend(t, 200, { id: "fixture-email-id" });
  const result = await mail.send({
    to: recipient,
    subject: "Welcome",
    html: "<p>Welcome</p>",
    text: "Welcome",
    cc: "copy@example.com",
    bcc: "archive@example.com",
    tags: [{ name: "kind", value: "welcome" }],
  });

  assert.deepEqual(payload(), {
    from: defaultFrom,
    reply_to: defaultReplyTo,
    to: recipient,
    subject: "Welcome",
    html: "<p>Welcome</p>",
    text: "Welcome",
    cc: "copy@example.com",
    bcc: "archive@example.com",
    tags: [{ name: "kind", value: "welcome" }],
  });
  assert.deepEqual(result.data, { id: "fixture-email-id" });
  assert.equal(result.error, null);
});

test("sends a Resend template and omits separate content", async (t) => {
  const { mail, payload } = mockSend(t, 200, { id: "fixture-template-id" });
  const template = { id: "welcome-template", variables: { name: "Reader" } };
  const result = await mail.send({
    to: recipient,
    from: "sender@example.com",
    replyTo: "reply@example.com",
    subject: "Welcome",
    html: "<p>Ignored</p>",
    text: "Ignored",
    template,
  });

  assert.deepEqual(payload(), {
    from: "sender@example.com",
    reply_to: "reply@example.com",
    to: recipient,
    subject: "Welcome",
    template,
  });
  assert.equal(result.data.id, "fixture-template-id");
});

test("rejects provider API errors without leaking error details", async (t) => {
  const { mail, payload } = mockSend(t, 422, {
    name: "validation_error",
    message: "Sensitive address reader@example.com and re_fixture_only",
  });
  await assert.rejects(
    mail.send({ to: recipient, subject: "Welcome", html: "<p>Welcome</p>" }),
    (error) => {
      assert.equal(error.message, "Resend could not send the email.");
      assert.equal(error.cause, undefined);
      assert.equal(error.statusCode, undefined);
      return true;
    },
  );
  assert.equal(payload().to, recipient);
});
