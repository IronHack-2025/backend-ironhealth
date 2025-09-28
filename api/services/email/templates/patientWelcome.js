// Plantilla para "bienvenida" cuando se registra un paciente. Devuelve subject/html/text. (Los adjuntos no son necesarios aquí.)

export function patientWelcomeTemplate({ firstName, portalUrl, lang = "es" }) {
  const safeName = firstName || (lang === "en" ? "Patient" : "Paciente");

  // textos por idioma:
  const t = (key) => {
    const dict = {
      es: {
        subject: `¡Bienvenido/a a IronHealth, ${safeName}!`,
        hello: `Hola ${safeName},`,
        thanks:
          "Gracias por registrarte en <b>IronHealth</b>. Ya puedes gestionar tus citas y tus datos.",
        cta: "Acceder al portal",
        footer:
          "Este es un correo automático. Si no esperabas este mensaje, ignóralo.",
      },
      en: {
        subject: `Welcome to IronHealth, ${safeName}!`,
        hello: `Hi ${safeName},`,
        thanks:
          "Thanks for signing up to <b>IronHealth</b>. You can now manage your appointments and data.",
        cta: "Go to portal",
        footer:
          "This is an automated email. If you didn’t expect it, please ignore.",
      },
    };
    return (dict[lang] || dict.es)[key];
  };

  const subject = t("subject");

  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5">
      <h2>${t("hello")}</h2>
      <p>${t("thanks")}</p>
      ${
        portalUrl
          ? `
        <p>
          <a href="${portalUrl}"
             style="display:inline-block;padding:10px 14px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none">
            ${t("cta")}
          </a>
        </p>`
          : ""
      }
      <p style="color:#6b7280;font-size:13px">${t("footer")}</p>
    </div>
  `;

  const text = [
    t("hello").replace(/<[^>]+>/g, ""),
    t("thanks").replace(/<[^>]+>/g, ""),
    portalUrl ? `${portalUrl}` : "",
    "",
  ].join("\n");

  return { subject, html, text };
}
