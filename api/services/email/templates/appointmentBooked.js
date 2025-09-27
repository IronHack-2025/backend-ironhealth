// Plantilla para "cita creada". Adjunta un .ics para añadir al calendario del paciente.
import { createAppointmentICS } from '../../../utils/ics.js'

/**
 * @param {{ patientName?:string, professionalName?:string, start:Date, end:Date, location?:string }} params
 */
export function appointmentBookedTemplate({
  patientName = 'Paciente',
  professionalName = 'Profesional',
  start,
  end,
  location = 'Consulta'
}) {
  const subject = `Cita confirmada con ${professionalName}`

  // Formateador simple de fecha/hora en es-ES (ajusta si quieres i18n real)
  const fmt = (d) => d.toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })

  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;font-size:16px;line-height:1.5">
      <h2>Hola ${patientName},</h2>
      <p>Tu cita con <b>${professionalName}</b> ha sido programada.</p>
      <ul>
        <li><b>Inicio:</b> ${fmt(start)}</li>
        <li><b>Fin:</b> ${fmt(end)}</li>
        <li><b>Lugar:</b> ${location}</li>
      </ul>
      <p>Adjuntamos un archivo para añadirla a tu calendario.</p>
      <p style="color:#6b7280;font-size:13px">Este es un correo automático, no respondas a este mensaje.</p>
    </div>
  `

  const text = [
    `Cita confirmada con ${professionalName}`,
    `Inicio: ${fmt(start)}`,
    `Fin: ${fmt(end)}`,
    `Lugar: ${location}`,
    ''
  ].join('\n')

  // Generamos el adjunto ICS
  const ics = createAppointmentICS({
    title: `Cita con ${professionalName}`,
    description: `Cita de ${patientName} con ${professionalName}`,
    location,
    start,
    end
  })

  // Resend espera attachments: [{ filename, content }]
  return { subject, html, text, attachments: [ics] }
}
