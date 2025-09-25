import Professional from '../models/professionals.model.js';
import getRandomColor from '../utils/assignColor.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

export const addProfessional = async (req, res) => {
  try {
    // Data is already validated by the middleware
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber } = req.body;

    const newProfessional = new Professional({
      firstName,
      lastName,
      profession,
      specialty,
      email,
      professionLicenceNumber,
      color: getRandomColor(),
    });

    const savedProfessional = await newProfessional.save();

    return success(res, savedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_CREATED, 201);
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
    const professionals = await Professional.find().lean();
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
