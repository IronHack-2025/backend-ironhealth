// GET Y POST

import Appointment from "../models/Appointment.model.js";

const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las citas', details: error });
    }
    
}

const postAppointments = async (req, res) => {
const { startDate, endDate, professionalId, patientId, notes } = req.body;
   
   
    if (!startDate || !endDate || !professionalId || !patientId) {
        return res.status(400).json({ error: "Faltan campos obligatorios." });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: "Fechas inválidas." });
    }
    if (start >= end) {
        return res.status(400).json({ error: "La fecha de inicio debe ser anterior a la fecha de fin." });
    }
    // Permitir citas para el mismo día si la hora es futura
    if (start.toDateString() === now.toDateString()) {
        if (start <= now) {
            return res.status(400).json({ error: "La hora de inicio debe ser futura si la cita es hoy." });
        }
    } else if (start < now) {
        return res.status(400).json({ error: "La fecha de inicio no puede ser en el pasado." });
    }
    if (end < now) {
        return res.status(400).json({ error: "La fecha de fin no puede ser en el pasado." });
    }

    if (typeof notes === 'string' && notes.length > 500) {
        return res.status(400).json({ error: "Las notas no pueden exceder los 500 caracteres." });
    }
    if (!/^[a-fA-F0-9]{24}$/.test(professionalId) || !/^[a-fA-F0-9]{24}$/.test(patientId)) {
        return res.status(400).json({ error: "ID de profesional o paciente no válido." });
    }

    // Verificar si el paciente o el profesional ya tiene una cita en ese rango de tiempo
    const overlappingAppointment = await Appointment.findOne({
        $or: [
            { professionalId, startDate: { $lt: endDate }, endDate: { $gt: startDate } },
            { patientId, startDate: { $lt: endDate }, endDate: { $gt: startDate } }
        ]
    });
    if (overlappingAppointment) {
        return res.status(409).json({ error: "El paciente o el profesional ya tiene una cita en ese horario." });
    }
    // Si todo está bien, crea la cita
     const newAppointment = new Appointment({ startDate, endDate, professionalId, patientId, notes });
    try {
        await newAppointment.save();
        res.status(201).json(newAppointment);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la cita', details: error });
    }

}

export { getAppointments, postAppointments };