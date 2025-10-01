import Patient from '../models/Patient.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';
import User from '../models/User.model.js';

export const postNewPatient = async (req, res) => {
  try {
    // Data is already validated and sanitized by express-validator middleware
    const { firstName, lastName, email, phone, birthDate, imageUrl,dni,
    gender,
    street,
    city,
    postalCode,
    nationality,
    emergencyContact } = req.body;

    const patientData = { firstName, lastName, email, phone, birthDate, dni, gender, street, city, postalCode, nationality, emergencyContact };
    if (imageUrl) {
      patientData.imageUrl = imageUrl;
    }

    const patient = await Patient.create(patientData);
    console.log(`Patient added successfully: ${patient}`);

     console.log(`🔑 Creating user with password: ${dni}`);
    
        const user = new User({
          email,
          password: dni, // Sin hashear, que lo haga el middleware
          role: "patient",
          profileId: patient._id,
          profileModel: "Patient",
        });
        await user.save();
        console.log(`✅ User created with email: ${email}`);

      await Patient.findByIdAndUpdate(patient._id, { userId: user._id });
     
         // 4. Obtener paciente actualizado para la respuesta
         const updatedPatient = await Patient.findById(patient._id);   
    return success(res, {
        patient: updatedPatient,
        authCreated: true,
        credentials: {
          email: user.email,
          defaultPassword: dni,
        },
      }, MESSAGE_CODES.SUCCESS.PATIENT_CREATED, 201);
  } catch (err) {
    console.error('Error creating patient:', err);
    // The custom validator should handle uniqueness, so this catch is for other db errors.
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const getAllPatients = async (req, res) => {
  try {
     const patients = await Patient.find({ active: true }).populate("userId", "-password");
    return success(res, patients, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED);
  } catch (err) {
    console.error('Error fetching patients:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patientDelete = await Patient.findById(id);

    if (!patientDelete) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND || "Patient not found", 404);
    }
    patientDelete.active = false;
    await patientDelete.save();

    return success(res, patientDelete, MESSAGE_CODES.SUCCESS.PATIENT_DELETED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};


export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patientEdit = await Patient.findOne({ _id: id, active: true });
    if (!patientEdit) {
      return error(res, MESSAGE_CODES.ERROR.PATIENT_NOT_FOUND || "Patient not found", 404);
    }

    return success(res, patientEdit, MESSAGE_CODES.SUCCESS.PATIENTS_RETRIEVED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const putEditPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, birthDate, dni, imageUrl, gender,
      street,
      city,
      postalCode,
      nationality,
      emergencyContact } = req.body || {};


    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate: new Date(birthDate),
        gender,
        street: street.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        nationality,
        emergencyContact: emergencyContact.trim(),
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
      },
      { new: true, runValidators: false }
    );

    return success(res, updatedPatient, MESSAGE_CODES.SUCCESS.PATIENT_UPDATED, 200);
  } catch (e) {
    console.error("Error en putEditPatient:", e);

    if (e?.code === 11000) {
      if (e?.keyPattern?.email) {
        return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
      }
      if (e?.keyPattern?.phone) {
        return validationError(res, [{ field: "phone", code: VALIDATION_CODES.PHONE_ALREADY_EXISTS }], 409);
      }
    }

    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e.message || "Unexpected error");
  }
};