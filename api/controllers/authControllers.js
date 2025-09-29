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
    
    // Buscar usuario SIN populate inicialmente
    const user = await User.findOne({ email, isActive: true });
    
    if (!user) {
      return error(res, MESSAGE_CODES.ERROR.INVALID_CREDENTIALS, 401);
    }
    
    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`🔍 Password comparison result: ${isPasswordValid}`);
    
    if (!isPasswordValid) {
      return error(res, MESSAGE_CODES.ERROR.INVALID_CREDENTIALS, 401);
    }
    
    // Populate solo si NO es admin y tiene profileId
    let populatedProfile = null;
    if (user.role !== 'admin' && user.profileId) {
      const populatedUser = await User.findById(user._id).populate('profileId');
      populatedProfile = populatedUser.profileId;
    }
    
    // Generar token - MANEJO CORRECTO DE PROFILEID
    const tokenPayload = { 
      id: user._id, 
      role: user.role
    };
    
    // Solo añadir profileId si no es null
    if (user.profileId) {
      tokenPayload.profileId = user.profileId;
    }
    
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Construir respuesta - MANEJO CORRECTO DE PROFILEID
    const userData = {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileId: user.profileId || null,
        profile: populatedProfile
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
      validationErrors.push({ field: 'newPassword', code: VALIDATION_CODES.PASSWORD_MIN_LENGTH, meta: { min: 6 } });
    }
    
    if (validationErrors.length > 0) {
      return validationError(res, validationErrors);
    }
    
    const user = await User.findById(req.user.id);
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return error(res, MESSAGE_CODES.ERROR.INCORRECT_PASSWORD, 400);
    }
    
    user.password = newPassword;
    await user.save();
    
    return success(res, null, MESSAGE_CODES.SUCCESS.PASSWORD_CHANGED, 200);
  } catch (err) {
    console.error('Error changing password:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

export const logout = async (req, res) => {
  try {
    // Opcional: Log del evento para auditoría
    console.log(`User ${req.user.id} logged out at ${new Date()}`);
    
    return success(res, null, MESSAGE_CODES.SUCCESS.LOGOUT_SUCCESSFUL, 200);
  } catch (err) {
    console.error('Error during logout:', err);
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};