import mongoose from 'mongoose'

const { Schema, model } = mongoose;

const patientSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 50,
    },
    lastName: {
        type: String,
        required: true,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 50,
        validate: {
            validator: function (email) {
                // Expresión regular para validar email
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: props => `${props.value} is not a valid email!`
        },
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(phone) {
                // Must start with +, followed by 11 digits, total length 12
                return /^\+?\d{7,15}$/.test(phone);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    birthDate: {
        type: Date,
        required: true,
    }
})

export const Patient = model('Patient', patientSchema)