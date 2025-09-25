import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import { success, error, validationError } from '../middlewares/responseHandler.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const validationErrors = [];
    
    if (!email) {
      validationErrors.push({ field: 'email', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED });
    }
    if (!password) {
      validationErrors.push({ field: 'password', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED });
    }
    
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors);
    }
    
    // Buscar usuario
    const user = await User.findOne({ email, isActive: true })
      .populate('profileId');
    
    if (!user) {
      return error(res, MESSAGE_CODES.ERROR.INVALID_CREDENTIALS, 401);
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return error(res, MESSAGE_CODES.ERROR.INVALID_CREDENTIALS, 401);
    }
    
    // Generar token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        profileId: user.profileId._id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    const userData = {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileId: user.profileId._id,
        profile: user.profileId
      }
    };
    
    return success(res, userData, MESSAGE_CODES.SUCCESS.LOGIN_SUCCESSFUL, 200);
  } catch (err) {
    console.error('Error during login:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const validationErrors = [];
    
    if (!currentPassword) {
      validationErrors.push({ field: 'currentPassword', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED });
    }
    if (!newPassword) {
      validationErrors.push({ field: 'newPassword', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED });
    }
    if (newPassword && newPassword.length < 6) {
      validationErrors.push({ field: 'newPassword', code: VALIDATION_CODES.NAME_MIN_LENGTH, meta: { min: 6 } });
    }
    
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors);
    }
    
    const user = await User.findById(req.user.id);
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return error(res, MESSAGE_CODES.ERROR.INCORRECT_PASSWORD, 400);
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();
    
    return success(res, null, MESSAGE_CODES.SUCCESS.PASSWORD_CHANGED, 200);
  } catch (err) {
    console.error('Error changing password:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const logout = async (req, res) => {
  // En un sistema sin estado (stateless) como JWT, el logout se maneja en el cliente
  return success(res, null, MESSAGE_CODES.SUCCESS.LOGOUT_SUCCESSFUL, 200);
};