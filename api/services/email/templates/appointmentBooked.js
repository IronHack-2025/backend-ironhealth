// Plantilla para "cita creada". Adjunta un .ics para añadir al calendario del paciente.
// Plantilla de "cita confirmada".

import { createAppointmentICS } from "../../../utils/ics.js";

const LOGO_URL = process.env.EMAIL_LOGO_URL || "";
const LOGO_WIDTH = Number(process.env.EMAIL_LOGO_WIDTH || 400); // px = para imagen imagen 640px
const BRAND_COLOR = "#2563eb"; // azul IronHealth
const TEXT_COLOR = "#111827";
const MUTED_COLOR = "#6b7280";
const BG_COLOR = "#f3f4f6";
const CARD_BG = "#ffffff";
const RADIUS = "12px";

export function appointmentBookedTemplate({
  patientName = "Paciente",
  professionalName = "Profesional",
  start,
  end,
  location = "Consulta",
  portalUrl = "",
  lang = "es",
}) {
  // Diccionario sencillo ES/EN
  const t = (key) => {
    const dict = {
      es: {
        subject: `Cita confirmada con ${professionalName}`,
        title: "Tu cita ha sido confirmada",
        hi: `Hola ${patientName},`,
        scheduled: `Tu cita con <b>${professionalName}</b> ha sido programada.`,
        start: "Inicio",
        end: "Fin",
        place: "Lugar",
        cta: "Ver mi cita",
        attach: "Adjuntamos un archivo para añadirla a tu calendario.",
        footer:
          "Este es un correo automático. Por favor, no respondas a este mensaje.",
      },
      en: {
        subject: `Appointment confirmed with ${professionalName}`,
        title: "Your appointment is confirmed",
        hi: `Hi ${patientName},`,
        scheduled: `Your appointment with <b>${professionalName}</b> has been scheduled.`,
        start: "Start",
        end: "End",
        place: "Location",
        cta: "View my appointment",
        attach: "We attach a file so you can add it to your calendar.",
        footer: "This is an automated email. Please do not reply.",
      },
    };
    return (dict[lang] || dict.es)[key];
  };

  // Formateo de fecha según idioma
  const fmt = (d) =>
    (d instanceof Date ? d : new Date(d)).toLocaleString(
      lang === "en" ? "en-US" : "es-ES",
      { dateStyle: "full", timeStyle: "short" }
    );

  const subject = t("subject");

  // === CHANGED: Botón "bulletproof" (VML + tabla con estilos inline) ===
  const buttonHtml = portalUrl
    ? `
    <!--[if mso]>
    <v:roundrect
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      href="${portalUrl}"
      style="height:44px;v-text-anchor:middle;width:240px;"
      arcsize="12%" stroke="f" fillcolor="${BRAND_COLOR}">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">
        ${t("cta")}
      </center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-- -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="center" bgcolor="${BRAND_COLOR}" style="border-radius:8px;">
          <a href="${portalUrl}" target="_blank"
             style="
               display:inline-block;
               padding:12px 18px;
               font-family:Arial,sans-serif;
               font-size:16px;
               font-weight:700;
               line-height:20px;
               color:#ffffff;
               text-decoration:none;
               background-color:${BRAND_COLOR};
               border-radius:8px;
               mso-padding-alt:0;
             ">
            ${t("cta")}
          </a>
        </td>
      </tr>
    </table>
    <!--<![endif]-->
  `
    : "";

  // Logo sin height="auto" como atributo; lo movemos al style
  const logoHtml = LOGO_URL ? `
  <tr>
    <td align="center" style="padding:24px 0 8px 0;">
      <img src="${LOGO_URL}" width="${LOGO_WIDTH}" alt="IronHealth"
           style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:100%;">
    </td>
  </tr>
` : "";


  const html = `
  <div style="margin:0;padding:0;background:${BG_COLOR};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BG_COLOR};padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                 style="max-width:600px;width:100%;background:${CARD_BG};border-radius:${RADIUS};
                        box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;">
            ${logoHtml}
            <tr>
              <td style="padding: 24px 24px 8px 24px;">
                <h1 style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.3;color:${TEXT_COLOR};">
                  ${t("title")}
                </h1>
                <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${TEXT_COLOR};">
                  ${t("hi")}
                </p>
                <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${TEXT_COLOR};">
                  ${t("scheduled")}
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 10px 0 12px 0;">
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};padding:6px 0;"><b>${t(
                      "start"
                    )}:</b> ${fmt(start)}</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};padding:6px 0;"><b>${t(
                      "end"
                    )}:</b> ${fmt(end)}</td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,sans-serif;font-size:15px;color:${TEXT_COLOR};padding:6px 0;"><b>${t(
                      "place"
                    )}:</b> ${location}</td>
                  </tr>
                </table>

                ${
                  portalUrl
                    ? `<div style="margin: 12px 0 8px 0; text-align:left;">${buttonHtml}</div>`
                    : ""
                }

                <p style="margin:12px 0 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:${MUTED_COLOR};">
                  ${t("attach")}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 24px 24px 24px;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:${MUTED_COLOR};">
                  ${t("footer")}
                </p>
              </td>
            </tr>
          </table>
          <div style="height:16px;line-height:16px;font-size:16px;">&zwnj;</div>
        </td>
      </tr>
    </table>
  </div>
  `;

  const text = [
    t("title"),
    "",
    t("hi").replace(/<[^>]+>/g, ""),
    t("scheduled").replace(/<[^>]+>/g, ""),
    `${t("start")}: ${fmt(start)}`,
    `${t("end")}: ${fmt(end)}`,
    `${t("place")}: ${location}`,
    portalUrl ? portalUrl : "",
    "",
  ].join("\n");

  // Adjuntar ICS
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
    start: start instanceof Date ? start : new Date(start),
    end: end instanceof Date ? end : new Date(end),
  });

  return { subject, html, text, attachments: [ics] };
}