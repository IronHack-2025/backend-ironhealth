import Professional from '../models/professionals.model.js';
import getRandomColor from '../utils/assignColor.js';
import User from "../models/User.model.js";
import nif_valido from '../utils/validateDNI.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

export const addProfessional = async (req, res) => {
  try {
    // Data is already validated by the middleware
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber, dni, imageUrl } = req.body;

    const newProfessional = new Professional({
      firstName,
      lastName,
      profession,
      specialty,
      email,
      dni,
      professionLicenceNumber,
      color: getRandomColor(),
    });
  if (imageUrl) {
      newProfessional.imageUrl = imageUrl;
    }
    const professional = await Professional.create(newProfessional);
    console.log(`Professional created successfully: ${professional._id}`);

console.log(`🔑 Creating professional user with password: "${dni}"`);
      
      const user = new User({
        email,
        password: dni, // Sin hashear, que lo haga el middleware
        role: 'professional',
        profileId: professional._id,
        profileModel: 'Professional',
        isActive: true
      });
      await user.save();
       console.log(`✅ Professional user created with email: ${email}`);
      
            // 3. Actualizar profesional con referencia al usuario
            await Professional.findByIdAndUpdate(professional._id, { userId: user._id });

      const updatedProfessional = await Professional.findById(professional._id);
            console.log(`User created successfully for professional: ${user.email}`);

   return success(res, {
          professional: updatedProfessional,
          authCreated: true,
          credentials: {
              email: user.email,
              defaultPassword: dni
          }
      }, MESSAGE_CODES.SUCCESS.PROFESSIONAL_CREATED, 201);
  } catch (e) {
    if (e?.code === 11000) {
      return error(res, MESSAGE_CODES.ERROR.EMAIL_ALREADY_EXISTS, 409, 'Email already in use.');
    }

    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
   const professionals = await Professional.find({ active: true }).populate('userId', '-password');
    return success(res, professionals, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};
export const deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalDelete = await Professional.findById(id);

    if (!professionalDelete) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND || "Professional not found", 404);
    }

    professionalDelete.active = !professionalDelete.active;
    await professionalDelete.save();

    return success(res, professionalDelete, MESSAGE_CODES.SUCCESS.PROFESSIONAL_DELETED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const getEditProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalEdit = await Professional.findOne({ _id: id, active: true });
    if (!professionalEdit) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND || "Professional not found", 404);
    }

    return success(res, professionalEdit, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (e) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e?.message || "Unexpected error");
  }
};

export const putEditProfessional = async (req, res) => {
  try {
    const { id } = req.params; 
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber, dni, imageUrl } = req.body || {};

    const updatedProfessional = await Professional.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profession: profession.trim(),
        specialty: specialty ? specialty.trim() : "",
        email: email.trim(),
        dni: dni.trim(),
        professionLicenceNumber: professionLicenceNumber ? professionLicenceNumber.trim() : "",
        ...(imageUrl && { imageUrl: imageUrl.trim() }), 
      },
      { new: true, runValidators: false } 
    );

    return success(res, updatedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_UPDATED, 200);
  } catch (e) {
    console.error("Error en putEditProfessional:", e);

    if (e?.code === 11000 && e?.keyPattern?.email) {
      return validationError(res, [{ field: "email", code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }], 409);
    }

    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, e.message || "Unexpected error");
  }
};