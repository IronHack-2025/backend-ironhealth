// Plantilla de bienvenida con estilos inline y botón "bulletproof"
// Compatible con Outlook (VML + tabla)
const LOGO_URL = process.env.EMAIL_LOGO_URL || '';
const LOGO_WIDTH = Number(process.env.EMAIL_LOGO_WIDTH || 400); // px = para imagen imagen 640px
const BRAND_COLOR = '#2a5fa6'; // azul IronHealth
const TEXT_COLOR = '#111827'; // gris muy oscuro
const MUTED_COLOR = '#6b7280'; // gris secundario
const BG_COLOR = '#f3f4f6'; // gris de fondo
const CARD_BG = '#ffffff'; // fondo del "card"
const RADIUS = '12px';

export function patientWelcomeTemplate({ firstName, portalUrl, lang = 'es' }) {
  const safeName = firstName || (lang === 'en' ? 'Patient' : 'Paciente');

  const t = key => {
    const dict = {
      es: {
        subject: `¡Bienvenido/a a IronHealth, ${safeName}!`,
        title: 'Bienvenido/a a IronHealth',
        hello: `Hola ${safeName},`,
        copy1:
          'Gracias por registrarte en <b>IronHealth</b>. A partir de ahora podrás gestionar tus citas, ver tus profesionales y mantener tus datos al día. Tus credenciales de acceso son tu email como nombre de usuario y tu DNI como contraseña.',
        copy2: 'Si tienes cualquier duda, responde a este correo y nuestro equipo te ayudará.',
        cta: 'Acceder a mi Panel',
        footer: 'Este es un correo automático. Si no esperabas este mensaje, puedes ignorarlo.',
      },
      en: {
        subject: `Welcome to IronHealth, ${safeName}!`,
        title: 'Welcome to IronHealth',
        hello: `Hi ${safeName},`,
        copy1:
          'Thanks for signing up to <b>IronHealth</b>. From now on you can manage your appointments, view your professionals and keep your data up to date. Your login credentials are your email as username and your ID as password.',
        copy2: 'If you have any questions, just reply to this email and our team will assist you.',
        cta: 'Go to my Dashboard',
        footer: 'This is an automated message. If you didn’t expect it, you can safely ignore it.',
      },
    };
    return (dict[lang] || dict.es)[key];
  };

  const subject = t('subject');

  // Botón "bulletproof" (tabla + VML para Outlook)
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
        ${t('cta')}
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
            ${t('cta')}
          </a>
        </td>
      </tr>
    </table>
    <!--<![endif]-->
  `
    : '';

  // Logo: quitamos height="auto" como atributo; lo ponemos en style
  const logoHtml = LOGO_URL
    ? `
    <tr>
      <td align="center" style="padding: 24px 0 8px 0;">
        <img src="${LOGO_URL}" width="${LOGO_WIDTH}" alt="IronHealth"
             style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:100%;">
      </td>
    </tr>
  `
    : '';

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
              <td style="padding: 28px 24px 10px 24px;">
                <h1 style="margin:0 0 18px 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.3;color:${TEXT_COLOR};">
                  ${t('title')}
                </h1>
                <p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${TEXT_COLOR};">
                  ${t('hello')}
                </p>
                <p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${TEXT_COLOR};">
                  ${t('copy1')}
                </p>
                <p style="margin:0 0 28px 0;font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:${TEXT_COLOR};">
                  ${t('copy2')}
                </p>
                <div style="margin: 12px 0 8px 0; text-align:left;">
                  ${buttonHtml}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 24px 24px 24px;">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:${MUTED_COLOR};">
                  ${t('footer')}
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
    t('title'),
    '',
    t('hello').replace(/<[^>]+>/g, ''),
    t('copy1').replace(/<[^>]+>/g, ''),
    t('copy2').replace(/<[^>]+>/g, ''),
    portalUrl ? portalUrl : '',
    '',
  ].join('\n');

  return { subject, html, text };
}
