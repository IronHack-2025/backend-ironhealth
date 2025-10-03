// providers/resendProvider.js
// Adaptador de Resend. Si cambiamos de proveedor, solo tocamos aquí.

import { Resend } from 'resend';

// Leemos configuración básica
const apiKey = process.env.RESEND_API_KEY;
const defaultFrom = process.env.EMAIL_FROM || 'no-reply@example.com';

// Instanciamos cliente con la apiKey
let client = null;
if (apiKey) client = new Resend(apiKey);

/**
 * Enviar email listo para ser enviado (subject/html/text/attachments).
 * La whitelist/sandbox se gestiona en la fachada (emailService).
 *
 * @param {Object} opts
 * @param {string} [opts.from] - remitente opcional; por defecto EMAIL_FROM
 * @param {string|string[]} opts.to - destinatario(s)
 * @param {string} opts.subject
 * @param {string} [opts.html]
 * @param {string} [opts.text]
 * @param {Array<{filename:string, content:string|Buffer, path?:string, content_type?:string, content_id?:string}>} [opts.attachments]
 * @returns {Promise<{id:string}>}
 */
export async function resendSend({ from, to, subject, html, text, attachments }) {
  if (!client) {
    throw new Error('RESEND_CLIENT_NOT_INITIALIZED');
  }
  if (!to || !subject) {
    throw new Error('MISSING_TO_OR_SUBJECT');
  }
  // Construimos el payload según Resend API
  const payload = {
    from: from || defaultFrom,
    to,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
    ...(Array.isArray(attachments) && attachments.length ? { attachments } : {}),
  };

  const resp = await client.emails.send(payload);

  // Normalizamos el id de mensaje
  const id = resp?.data?.id || resp?.id || 'unknown';
  return { id };
}
