
// Plantilla para "bienvenida" cuando se registra un paciente. Devuelve subject/html/text. (Los adjuntos no son necesarios aquí.)

export function patientWelcomeTemplate({ firstName, portalUrl }) {
    const safeName = firstName || 'Paciente'
    const subject = `¡Bienvenido/a a IronHealth, ${safeName}!`
  
    const html = `
      <div style="font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5">
        <h2>Hola ${safeName},</h2>
        <p>Gracias por registrarte en <b>IronHealth</b>. Ya puedes gestionar tus citas y tus datos.</p>
        ${portalUrl ? `
          <p>
            <a href="${portalUrl}"
               style="display:inline-block;padding:10px 14px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none">
              Acceder al portal
            </a>
          </p>` : ''
        }
        <p style="color:#6b7280;font-size:13px">Este es un correo automático. Si no esperabas este mensaje, ignóralo.</p>
      </div>
    `
  
    const text = [
      `Hola ${safeName},`,
      `Gracias por registrarte en IronHealth.`,
      portalUrl ? `Acceso al portal: ${portalUrl}` : '',
      ''
    ].join('\n')
  
    return { subject, html, text }
  }
  