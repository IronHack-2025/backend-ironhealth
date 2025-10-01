import mongoose from 'mongoose'
import nif_valido from '../utils/validateDNI.js';

const { Schema } = mongoose;

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
            message: props => `${props.value} is not a valid email!`,
        },
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (phone) {
                // Must start with +, followed by 11 digits, total length 12
                return /^\+?\d{7,15}$/.test(phone);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
        },
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
            validator: function (phone) {
                // Must start with +, followed by 11 digits, total length 12
                return /^\+?\d{7,15}$/.test(phone);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    dni: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: nif_valido,
            message: props => `${props.value} is not a valid DNI/NIE!`
        }
    },
    birthDate: {
        type: Date,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
        default: 'https://res.cloudinary.com/dt7uhxeuk/image/upload/v1758209486/professionals/jqluodx877l67l1gmktx.png'
    },
    gender: {
        type: String,
        required: true,
        enum: {
            values: ['male', 'female', 'non-binary'],
            message: 'Gender must be: male, female, or non-binary'
        }
    },
    street: { type: String, required: true, maxlength: 100 },
    city: { type: String, required: true, maxlength: 50 },
    postalCode: { type: String, required: true, maxlength: 10 },
    nationality: {
        type: String,
        required: true,
        maxlength: 50,
        validate: {
            validator: function (nationality) {
                if (!nationality) return true; // Optional field
                // Only letters, spaces, hyphens, and common nationality suffixes
                return /^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s\-]+$/.test(nationality) && nationality.length >= 2;
            },
            message: 'Nationality must contain only letters, spaces, and hyphens, minimum 2 characters'
        }
    },
    emergencyContact: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (phone) {
                // Must start with +, followed by 11 digits, total length 12
                return /^\+?\d{7,15}$/.test(phone);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    }, userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true // Permite null y mantiene unicidad para valores no null
    },
    active: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema)


