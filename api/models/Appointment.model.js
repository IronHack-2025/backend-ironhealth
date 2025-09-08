import mongoose from 'mongoose'

const { Schema, model } = mongoose;

const appointmentSchema = new Schema({
    professionalId: {
        type: String,
        required: true,
        // Validación
    },
    patientId: {
        type: String,
        required: true,
        // Validator
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    notes: {
        type: String,
        required: false,
    }
})

export const Appointment = model('Appointment', appointmentSchema)