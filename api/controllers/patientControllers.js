import Patient from "../models/Patient.model.js";
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import { success, error, validationError } from '../middlewares/responseHandler.js';

export const postNewPatient = async (req, res) => {
    const { firstName, lastName, email, phone, birthDate, imageUrl } = req.body;
    
    const validationErrors = [];
    
    if (!req.body) {
        return validationError(res, [{ field: 'body', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED }]);
    }
    
    if (typeof firstName !== "string" || typeof lastName !== "string") {
        validationErrors.push({ field: 'firstName', code: VALIDATION_CODES.NAME_MUST_BE_STRING });
        validationErrors.push({ field: 'lastName', code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    }
    
    if (firstName && firstName.length <= 2) {
        validationErrors.push({ field: 'firstName', code: VALIDATION_CODES.NAME_MIN_LENGTH });
    }
    
    if (lastName && lastName.length <= 2) {
        validationErrors.push({ field: 'lastName', code: VALIDATION_CODES.NAME_MIN_LENGTH });
    }
    
    if (firstName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(firstName)) {
        validationErrors.push({ field: 'firstName', code: VALIDATION_CODES.NAME_INVALID_CHARACTERS });
    }
    
    if (lastName && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(lastName)) {
        validationErrors.push({ field: 'lastName', code: VALIDATION_CODES.NAME_INVALID_CHARACTERS });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push({ field: 'email', code: VALIDATION_CODES.EMAIL_INVALID_FORMAT });
    }
    
    // Verificar si el email ya existe
    try {
        const existingEmail = await Patient.findOne({ email });
        if (existingEmail) {
            validationErrors.push({ field: 'email', code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS });
        }
        
        const existingPhone = await Patient.findOne({ phone });
        if (existingPhone) {
            validationErrors.push({ field: 'phone', code: VALIDATION_CODES.PHONE_ALREADY_EXISTS });
        }
    } catch (err) {
        console.error('Error checking existing records:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
    }
    
    const today = new Date();
    if (birthDate >= today) {
        validationErrors.push({ field: 'birthDate', code: VALIDATION_CODES.BIRTHDATE_INVALID });
    }
    
    // Si hay errores de validación, devolverlos todos
    if (validationErrors.length > 0) {
        return validationError(res, validationErrors);
    }
    
    try {
        const patientData = {
            firstName,
            lastName,
            email,
            phone,
            birthDate
        };
        
        if (imageUrl) {
            patientData.imageUrl = imageUrl;
        }
        
        const patient = await Patient.create(patientData);
        console.log(`Patient added successfully: ${patient}`);
        
        return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENT_CREATED, 201);
        
    } catch (err) {
        console.error('Error creating patient:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
    }
}

export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        return success(res, patients, MESSAGE_CODES.SUCCESS.PATIENT_UPDATED);
    } catch (err) {
        console.error('Error fetching patients:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
    }
}









