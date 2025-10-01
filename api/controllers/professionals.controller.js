import Professional from '../models/professionals.model.js';
import User from '../models/User.model.js';
import getRandomColor from '../utils/assignColor.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

export const addProfessional = async (req, res) => {
  try {
    // Data is already validated and sanitized by express-validator middleware
    const {
      firstName,
      lastName,
      profession,
      specialty,
      email,
      dni,
      professionLicenceNumber,
      imageUrl,
    } = req.body;

    // 1. Create professional without userId first
    const professionalData = {
      firstName,
      lastName,
      profession,
      specialty,
      email,
      dni,
      professionLicenceNumber,
      color: getRandomColor(),
    };

    if (imageUrl) {
      professionalData.imageUrl = imageUrl;
    }

    const professional = await Professional.create(professionalData);
    console.log(`Professional created successfully: ${professional._id}`);

    // 2. Create user automatically - middleware handles password hashing
    console.log(`🔑 Creating professional user with password: "${dni}"`);

    const user = new User({
      email,
      password: dni, // Will be hashed by the model middleware
      role: 'professional',
      profileId: professional._id,
      profileModel: 'Professional',
      isActive: true,
    });
    await user.save();

    console.log(`✅ Professional user created with email: ${email}`);

    // 3. Update professional with user reference
    await Professional.findByIdAndUpdate(professional._id, { userId: user._id });

    // 4. Get updated professional for response
    const updatedProfessional = await Professional.findById(professional._id);

    // Extended response with authentication info
    return success(
      res,
      {
        professional: updatedProfessional,
        authCreated: true,
        credentials: {
          email: user.email,
          defaultPassword: dni,
        },
      },
      MESSAGE_CODES.SUCCESS.PROFESSIONAL_CREATED,
      201
    );
  } catch (err) {
    console.error('Error creating professional:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
    // Populate user reference (without password for security)
    const professionals = await Professional.find({ active: true }).populate('userId', '-password');
    return success(res, professionals, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (err) {
    console.error('Error fetching professionals:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const professional = await Professional.findOne({ _id: id, active: true });

    if (!professional) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND, 404);
    }

    return success(res, professional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_RETRIEVED, 200);
  } catch (err) {
    console.error('Error fetching professional:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      profession,
      specialty,
      email,
      dni,
      professionLicenceNumber,
      imageUrl,
    } = req.body;

    // Check if professional exists
    const existingProfessional = await Professional.findById(id);
    if (!existingProfessional) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND, 404);
    }

    // Update professional
    const updatedProfessional = await Professional.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profession: profession.trim(),
        specialty: specialty ? specialty.trim() : '',
        email: email.trim().toLowerCase(),
        dni: dni.trim(),
        professionLicenceNumber: professionLicenceNumber ? professionLicenceNumber.trim() : '',
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
      },
      { new: true, runValidators: false }
    );

    return success(res, updatedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_UPDATED, 200);
  } catch (err) {
    console.error('Error updating professional:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professional = await Professional.findById(id);

    if (!professional) {
      return error(res, MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND, 404);
    }

    // Soft delete - toggle active status
    professional.active = !professional.active;
    await professional.save();

    return success(res, professional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_DELETED, 200);
  } catch (err) {
    console.error('Error deleting professional:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};
