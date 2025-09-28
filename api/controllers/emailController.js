// Controlador del endpoint POST /api/sendEmail
import { z } from "zod";
import { emailService } from "../services/email/index.js";
import { success, validationError, error } from "../middlewares/responseHandler.js";
import { MESSAGE_CODES, VALIDATION_CODES } from "../utils/messageCodes.js";

// Esquema de entrada para validar el cuerpo del POST
const schema = z.object({
  to: z.string().email().min(5, { message: "EMAIL_INVALID_FORMAT" }),
  subject: z.string().min(1).max(150).optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  // O bien se usa una plantilla:
  template: z.enum(["patient_welcome", "appointment_booked"]).optional(),
  // ...con datos opcionales para la plantilla
  data: z.object({}).passthrough().optional(),
});

export async function sendEmailController(req, res) {
  // 1) Validación de entrada
  const parsed = schema.safeParse(req.body || {});
  if (!parsed.success) {
    // Convertimos errores de Zod a nuestra estructura "details"
    const details = parsed.error.issues.map((i) => ({
      field: i.path.join(".") || "payload",
      code: VALIDATION_CODES?.[i.message] || i.message, // mapea si tienes el código, si no deja el texto
    }));
    return validationError(res, details, 400);
  }

  const { to, subject, html, text, template, data } = parsed.data;

  try {
    // 2) Lógica para enviar el email
    if (template) {
      // Enviamos por plantilla
      const resp = await emailService.sendTemplate({ template, to, data });
      return success(res, { id: resp.id }, MESSAGE_CODES.SUCCESS.EMAIL_SENT, 200);
    }

    // Si no hay plantilla, validamos mínimo subject + (html o text)
    if (!subject || (!html && !text)) {
      return validationError(res, [{ field: "payload", code: VALIDATION_CODES.FORM_FIELDS_REQUIRED }], 400);
    }

    const resp = await emailService.send({ to, subject, html, text });
    return success(res, { id: resp.id }, MESSAGE_CODES.SUCCESS.EMAIL_SENT, 200);
  } catch (e) {
    // 3) Errores controlados
    if (String(e?.message).includes("EMAIL_TEMPLATE_NOT_FOUND")) {
      return error(res, MESSAGE_CODES.ERROR.EMAIL_TEMPLATE_NOT_FOUND, 400);
    }
    if (e?.code === "EMAIL_TOO_LARGE") {
      // Si activamos EMAIL_MAX_TOTAL_SIZE_MB en tu servicio, devolvemos 413 (Payload Too Large)
      return validationError(res, [{ field: "attachments", code: "EMAIL_TOO_LARGE" }], 413);
    }
    return error(res, MESSAGE_CODES.ERROR.EMAIL_SEND_FAILED, 500, e?.message || "Unexpected error");
  }
}
