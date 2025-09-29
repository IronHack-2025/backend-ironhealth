import Patient from "../models/Patient.model.js";
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import { success, error, validationError } from '../middlewares/responseHandler.js';

export const postNewPatient = async (req, res) => {
    const { firstName, lastName, email, phone, birthDate, imageUrl, gender, street, city, postalCode, nationality, emergencyContact } = req.body;
    
    const validationErrors = [];
    
    if (!req.body) {
        return validationError(res, [{ field: 'body', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED }]);
    }
    
    // Validate firstName and lastName
    if (typeof firstName !== "string" || typeof lastName !== "string") {
        validationErrors.push({ field: 'firstName', code: VALIDATION_CODES.NAME_MUST_BE_STRING });
        validationErrors.push({ field: 'lastName', code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    }
    
    // Validate gender
    if (!['male', 'female', 'non-binary'].includes(gender)) {
        validationErrors.push({ field: 'gender', code: VALIDATION_CODES.GENDER_INVALID });
    }

    // Validate street (more flexible - letters, numbers, spaces, common punctuation)
    if (typeof street !== 'string' || street.trim().length < 2 || street.trim().length > 100 ||
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç0-9\s.,ºª'\-\/()#]+$/.test(street.trim())) {
        validationErrors.push({ field: 'street', code: VALIDATION_CODES.STREET_INVALID_FORMAT });
    }

    // Validate city (only letters, spaces, hyphens, apostrophes, 2-50 chars)
    if (typeof city !== 'string' || city.trim().length < 2 || city.trim().length > 50 ||
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s'\-]+$/.test(city.trim())) {
        validationErrors.push({ field: 'city', code: VALIDATION_CODES.CITY_INVALID_FORMAT });
    }

    // Validate postalCode (Spain 5 digits; change if needed)
    if (typeof postalCode !== 'string' || !/^\d{5}$/.test(postalCode.trim())) {
        validationErrors.push({ field: 'postalCode', code: VALIDATION_CODES.POSTAL_CODE_INVALID_FORMAT });
    }

    // Validate nationality
    if (nationality && !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s\-]+$/.test(nationality)) {
        validationErrors.push({ field: 'nationality', code: VALIDATION_CODES.NATIONALITY_INVALID });
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        validationErrors.push({ field: 'email', code: VALIDATION_CODES.EMAIL_INVALID_FORMAT });
    }

    // Validate phone
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        validationErrors.push({ field: 'phone', code: VALIDATION_CODES.PHONE_INVALID_FORMAT });
    }

    // Validate emergencyContact
    if (!/^\+?\d{7,15}$/.test(emergencyContact)) {
        validationErrors.push({ field: 'emergencyContact', code: VALIDATION_CODES.EMERGENCY_CONTACT_INVALID });
    }

    // Check for existing email and phone
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
    if (new Date(birthDate) >= today) {
        validationErrors.push({ field: 'birthDate', code: VALIDATION_CODES.BIRTHDATE_INVALID });
    }
    
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
        return validationError(res, validationErrors);
    }
    
    try {
        const patientData = {
            firstName,
            lastName,
            email,
            phone,
            birthDate,
            imageUrl,
            gender,
            street,
            city,
            postalCode,
            nationality,
            emergencyContact,
        };
        
        const patient = await Patient.create(patientData);
        console.log(`Patient added successfully: ${patient}`);
        res.status(201).json(patient);
    } catch (err) {
        console.error(err);
        res.status(400).json(`Error registering patient`);
    }
};

export const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        return success(res, patients, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
    } catch (err) {
        console.error('Error fetching patients:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
    }
}

export const getPatientById = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await Patient.findById(id);
        if (!patient) {
            return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND, 404, 'Patient not found');
        }
        return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
    } catch (err) {
        console.error('Error fetching patient by ID:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
    }
}







