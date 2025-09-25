import Patient from '../models/Patient.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

export const postNewPatient = async (req, res) => {
  try {
    // Data is already validated and sanitized by express-validator middleware
    const { firstName, lastName, email, phone, birthDate, imageUrl } = req.body;

    const patientData = { firstName, lastName, email, phone, birthDate };
    if (imageUrl) {
      patientData.imageUrl = imageUrl;
    }

    const patient = await Patient.create(patientData);
    console.log(`Patient added successfully: ${patient}`);

    return success(res, patient, MESSAGE_CODES.SUCCESS.PATIENT_CREATED, 201);
  } catch (err) {
    console.error('Error creating patient:', err);
    // The custom validator should handle uniqueness, so this catch is for other db errors.
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
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
};
