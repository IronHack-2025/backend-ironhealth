import User from '../models/User.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { success, error } from '../middlewares/responseHandler.js';

export const getAllUsers = async (req, res) => {
  try {
    // Usuarios con populate completo de sus profiles
    const users = await User.find({ isActive: true }).populate('profileId').select('-password');

    return success(res, users, MESSAGE_CODES.SUCCESS.USERS_RETRIEVED);
  } catch (err) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};
