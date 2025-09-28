// Plantilla para "cita creada". Adjunta un .ics para añadir al calendario del paciente.
import { createAppointmentICS } from "../../../utils/ics.js";

// Recibe datos y devuelve { subject, html, text, attachments }
export function appointmentBookedTemplate({
  patientName = "Paciente",
  professionalName = "Profesional",
  start,
  end,
  location = "Consulta",
  lang = "es",
}) {
  // textos por idioma (usa patientName y professionalName ya formateados)
  const t = (key) => {
    const dict = {
      es: {
        subject: `Cita confirmada con ${professionalName}`,
        hi: `Hola ${patientName},`,
        scheduled: `Tu cita con <b>${professionalName}</b> ha sido programada.`,
        start: "Inicio",
        end: "Fin",
        place: "Lugar",
        attach: "Adjuntamos un archivo para añadirla a tu calendario.",
        footer: "Este es un correo automático, no respondas a este mensaje.",
      },
      en: {
        subject: `Appointment confirmed with ${professionalName}`,
        hi: `Hi ${patientName},`,
        scheduled: `Your appointment with <b>${professionalName}</b> has been scheduled.`,
        start: "Start",
        end: "End",
        place: "Location",
        attach: "We attach a file so you can add it to your calendar.",
        footer: "This is an automated email, please do not reply.",
      },
    };
    return (dict[lang] || dict.es)[key];
  };

  // Asunto del email
  const subject = t("subject");
  const fmt = (d) =>
    d.toLocaleString(lang === "en" ? "en-US" : "es-ES", {
      dateStyle: "full",
      timeStyle: "short",
    });

  // Construye el HTML del email
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5">
      <h2>${t("hi")}</h2>
      <p>${t("scheduled")}</p>
      <ul>
        <li><b>${t("start")}:</b> ${fmt(start)}</li>
        <li><b>${t("end")}:</b> ${fmt(end)}</li>
        <li><b>${t("place")}:</b> ${location}</li>
      </ul>
      <p>${t("attach")}</p>
      <p style="color:#6b7280;font-size:13px">${t("footer")}</p>
    </div>
  `;

  // Texto plano (por si el cliente no soporta HTML)
  const text = [
    t("hi").replace(/<[^>]+>/g, ""),
    t("scheduled").replace(/<[^>]+>/g, ""),
    `${t("start")}: ${fmt(start)}`,
    `${t("end")}: ${fmt(end)}`,
    `${t("place")}: ${location}`,
    "",
  ].join("\n");

  // Crea el adjunto .ics para añadir al calendario
  const ics = createAppointmentICS({
    title:
      lang === "en"
        ? `Appointment with ${professionalName}`
        : `Cita con ${professionalName}`,
    description:
      lang === "en"
        ? `Appointment of ${patientName} with ${professionalName}`
        : `Cita de ${patientName} con ${professionalName}`,
    location,
    start,
    end,
  });

  return { subject, html, text, attachments: [ics] };
}
