// Fachada del servicio de email con:
//  - Sandbox/whitelist en desarrollo (para no ser baneados)
//  - Proveedor Resend detrás (adaptador)
//  - Envío por plantilla o crudo (subject/html/text)

import { resendSend } from "./providers/resendProvider.js";

// Flags de seguridad/levers de configuración
const EMAIL_ENABLED =
  String(process.env.EMAIL_ENABLED || "").toLowerCase() === "true";
const FROM = process.env.EMAIL_FROM || "no-reply@example.com";

// Lista blanca para desarrollo (cuando EMAIL_ENABLED=false)
// Soporta "*@dominio.com" y correos exactos. Separado por comas.
const WHITELIST = String(process.env.EMAIL_DEV_WHITELIST || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Normaliza "to" como array de strings.
 * Aceptamos string o array (Resend soporta ambas).
 */
function normalizeTo(to) {
  if (!to) return [];
  return Array.isArray(to) ? to : [to];
}

/**
 * Devuelve true si "email" está permitido cuando EMAIL_ENABLED=false
 */
function isAllowedWhenDisabled(email) {
  const e = String(email).toLowerCase();
  return WHITELIST.some((rule) => {
    const r = rule.toLowerCase();
    if (r.startsWith("*@")) return e.endsWith(r.slice(1)); // *@dominio.com
    return e === r; // coincidencia exacta
  });
}

/**
 * Determina si vamos a enviar realmente o simular (sandbox).
 */
function canSend(toList) {
  if (EMAIL_ENABLED) return true; // en producción o cuando actives, enviamos
  if (WHITELIST.length === 0) return false;
  return toList.every((addr) => isAllowedWhenDisabled(addr));
}

/**
 * Envío "crudo" (sin plantillas), respetando guardas y proveedor.
 */
async function sendRaw({ to, subject, html, text, attachments }) {
  const toList = normalizeTo(to);
  if (toList.length === 0) throw new Error("MISSING_RECIPIENT");

  if (!canSend(toList)) {
    // Sandbox: no enviamos, pero logeamos y devolvemos un id fake
    console.log(
      '[EMAIL SANDBOX] BLOCKED send to=%o subject="%s"',
      toList,
      subject
    );
    return { id: "sandbox-skip" };
  }

  // Delegamos en el adaptador del proveedor (Resend)
  return resendSend({ to: toList, subject, html, text, attachments });
}

export const emailService = {
  /**
   * Enviar con contenido directo (subject/html/text/attachments).
   * Uso: emailService.send({ to, subject, html, text, attachments })
   */
  async send({ to, subject, html, text, attachments }) {
    if (!subject && !html && !text) {
      throw new Error("MISSING_CONTENT");
    }
    return sendRaw({ to, subject, html, text, attachments });
  },

  /**
   * Enviar usando una plantilla interna.
   * Uso: emailService.sendTemplate({ template:'patient_welcome', to, data:{...} })
   */
  async sendTemplate({ template, to, data }) {
    if (!template) throw new Error("TEMPLATE_REQUIRED");

    switch (template) {
      case "patient_welcome": {
        // Import dinámico para cargar solo cuando se usa esa plantilla
        const { patientWelcomeTemplate } = await import(
          "./templates/patientWelcome.js"
        );
        const t = patientWelcomeTemplate({ ...data });
        return sendRaw({ to, ...t });
      }
      case "appointment_booked": {
        const { appointmentBookedTemplate } = await import(
          "./templates/appointmentBooked.js"
        );
        const t = appointmentBookedTemplate({ ...data });
        return sendRaw({ to, ...t });
      }
      default:
        throw new Error("EMAIL_TEMPLATE_NOT_FOUND");
    }
  },
};
