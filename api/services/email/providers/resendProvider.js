// Adaptador de Resend. En caso de cambiar de proveedor de email, solo cambiamos este:

import { Resend } from 'resend'

// Leemos configuración básica
const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM

// Instanciamos cliente con la apiKey
let client = null
if (apiKey) client = new Resend(apiKey)

/**
 * Enviar email listo para enviar (ya con subject/html/text/attachments).
 * No aplica lógica de whitelist/sandbox: eso se hace en la fachada.
 *
 * @param {Object} opts
 * @param {string|string[]} opts.to - destinatario(s)
 * @param {string} opts.subject
 * @param {string} [opts.html]
 * @param {string} [opts.text]
 * @param {Array<{filename:string, content:string|Buffer}>} [opts.attachments]
 * @returns {Promise<{id:string}>}
 */

export async function resendSend({ to, subject, html, text, attachments }) {
  if (!client) {
    // En caso de no estar configurado, lanzamos error
    throw new Error('RESEND_CLIENT_NOT_INITIALIZED')
  }

  // Resend admite: from, to, subject, html/text y attachments [{filename, content}]
  const resp = await client.emails.send({
    from,
    to,
    subject,
    html,
    text,
    attachments
  })

  // Normalizamos el id de mensaje
  const id = resp?.data?.id || resp?.id || 'unknown'
  return { id }
}
