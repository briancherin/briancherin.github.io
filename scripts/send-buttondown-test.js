#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const API_BASE = "https://api.buttondown.com/v1";
const DEFAULT_HTML_PATH = path.join(process.cwd(), "dist", "newsletter-weekly-email.html");

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildSubject() {
  const configured = process.env.BUTTONDOWN_SUBJECT;
  if (configured) return configured;
  const now = new Date().toISOString().slice(0, 10);
  return `Weekly Garden Updates - TEST - ${now}`;
}

function readHtmlBody(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const prefix = "<!-- buttondown-editor-mode: fancy -->\n";
  if (bodyMatch && bodyMatch[1]) {
    return prefix + bodyMatch[1].trim();
  }
  return prefix + raw;
}

function makeClient(apiKey) {
  return axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
  });
}

async function createDraft(client, subject, bodyHtml) {
  const response = await client.post("/emails", {
    subject,
    body: bodyHtml,
    status: "draft",
  });
  const emailId = response.data?.id;
  if (!emailId) throw new Error("Buttondown draft creation succeeded but no email id returned.");
  return emailId;
}

async function sendDraft(client, emailId, recipient) {
  await client.post(`/emails/${emailId}/send-draft`, {
    recipients: [recipient],
  });
}

async function main() {
  const apiKey = requireEnv("BUTTONDOWN_API_KEY");
  const recipient = getArg("recipient") || process.env.BUTTONDOWN_TEST_RECIPIENT;
  if (!recipient) {
    throw new Error("Provide test recipient via --recipient=you@example.com or BUTTONDOWN_TEST_RECIPIENT.");
  }

  if (!fs.existsSync(DEFAULT_HTML_PATH)) {
    throw new Error(`Newsletter HTML not found: ${DEFAULT_HTML_PATH}`);
  }

  const bodyHtml = readHtmlBody(DEFAULT_HTML_PATH);
  const subject = buildSubject();
  const client = makeClient(apiKey);

  const draftId = await createDraft(client, subject, bodyHtml);
  console.log(`Created draft email: ${draftId}`);

  await sendDraft(client, draftId, recipient);
  console.log(`Sent draft preview to: ${recipient}`);
}

main().catch((error) => {
  const status = error?.response?.status;
  const payload = error?.response?.data;
  console.error("Buttondown send test failed.");
  if (status) console.error(`HTTP ${status}`);
  if (payload) console.error(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
  else console.error(error.message);
  process.exit(1);
});
