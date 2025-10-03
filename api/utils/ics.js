// Utilidad para generar un archivo .ics (calendario) que Google Calendar/Outlook entienden.

import { createEvent } from 'ics';

/**
 * Genera un adjunto ICS para una cita.
 *
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.location]
 * @param {Date} opts.start
 * @param {Date} opts.end
 * @param {{name:string,email:string}} [opts.organizer]
 * @returns {{ filename:string, content:string }}  // content: texto ICS
 */
export function createAppointmentICS({
  title,
  description = '',
  location = '',
  start,
  end,
  organizer,
}) {
  // ics espera un array: [YYYY, M, D, H, m]
  const toParts = d => [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  ];

  const { error, value } = createEvent({
    title,
    description,
    location,
    start: toParts(start),
    end: toParts(end),
    organizer, // opcional
  });

  if (error) throw error;

  return { filename: 'cita.ics', content: value };
}
