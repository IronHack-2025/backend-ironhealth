import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { error } from './responseHandler.js';
import Appointment from '../models/Appointment.model.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return error(res, MESSAGE_CODES.ERROR.TOKEN_NOT_PROVIDED, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario sin populate inicialmente
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return error(res, MESSAGE_CODES.ERROR.INVALID_USER, 401);
    }

    // Hacer populate completo si NO es admin y tiene profileId
    let populatedProfile = null;
    if (user.role !== 'admin' && user.profileId) {
      const populatedUser = await User.findById(user._id).populate('profileId').select('-password');
      populatedProfile = populatedUser.profileId;
    }

    req.user = {
      id: user._id,
      role: user.role,
      profileId: user.profileId,
      profile: populatedProfile, // Aquí tenemos toda la información del Professional/Patient
    };

    next();
  } catch (err) {
    return error(res, MESSAGE_CODES.ERROR.INVALID_TOKEN, 401);
  }
};

export const requireRole = roles => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return error(res, MESSAGE_CODES.ERROR.INSUFFICIENT_PERMISSIONS, 403);
    }
    next();
  };
};

export const requireOwnProfile = (req, res, next) => {
  const profileId = req.params.id;

  if (req.user.profileId.toString() !== profileId && req.user.role !== 'admin') {
    return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_PROFILE_ACCESS, 403);
  }

  next();
};

// Middleware para verificar que el usuario puede acceder/modificar un paciente específico
export const requireOwnPatientOrAdmin = (req, res, next) => {
  const patientId = req.params.id;

  // Los admins pueden acceder a cualquier paciente
  if (req.user.role === 'admin') {
    return next();
  }

  // Los profesionales pueden acceder a cualquier paciente (para gestionar citas)
  if (req.user.role === 'professional') {
    return next();
  }

  // Los pacientes solo pueden acceder a su propio perfil
  if (req.user.role === 'patient' && req.user.profileId.toString() === patientId) {
    return next();
  }

  return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_PROFILE_ACCESS, 403);
};

// Middleware para verificar que el usuario puede acceder/modificar un profesional específico
export const requireOwnProfessionalOrAdmin = (req, res, next) => {
  const professionalId = req.params.id;

  // Los admins pueden acceder a cualquier profesional
  if (req.user.role === 'admin') {
    return next();
  }

  // Los profesionales solo pueden acceder a su propio perfil
  if (req.user.role === 'professional' && req.user.profileId.toString() === professionalId) {
    return next();
  }

  return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_PROFILE_ACCESS, 403);
};

// Middleware para appointments - pacientes solo pueden gestionar sus propias citas (DELETE)
export const requireOwnAppointmentOrAdmin = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    // Los admins pueden acceder a cualquier cita
    if (req.user.role === 'admin') {
      return next();
    }

    // Los profesionales pueden acceder a cualquier cita
    if (req.user.role === 'professional') {
      return next();
    }

    // Los pacientes solo pueden acceder a sus propias citas
    if (req.user.role === 'patient') {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
      }
      if (appointment.patientId.toString() !== req.user.profileId.toString()) {
        return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_ACCESS, 403);
      }
      return next();
    }

    return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_ACCESS, 403);
  } catch (err) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};

// Middleware específico para cancelar citas (PUT) - pacientes solo pueden cancelar sus propias citas
export const requireCancelOwnAppointment = async (req, res, next) => {
  try {
    const appointmentId = req.params.id;

    // Los admins y profesionales pueden cancelar cualquier cita
    if (req.user.role === 'admin' || req.user.role === 'professional') {
      return next();
    }

    // Los pacientes solo pueden cancelar sus propias citas
    if (req.user.role === 'patient') {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return error(res, MESSAGE_CODES.ERROR.APPOINTMENT_NOT_FOUND, 404);
      }
      if (appointment.patientId.toString() !== req.user.profileId.toString()) {
        return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_ACCESS, 403);
      }
      return next();
    }

    return error(res, MESSAGE_CODES.ERROR.UNAUTHORIZED_ACCESS, 403);
  } catch (err) {
    return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
  }
};
