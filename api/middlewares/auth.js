import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { MESSAGE_CODES } from '../utils/messageCodes.js';
import { error } from './responseHandler.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return error(res, MESSAGE_CODES.ERROR.TOKEN_NOT_PROVIDED, 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('profileId')
      .select('-password');
    
    if (!user || !user.isActive) {
      return error(res, MESSAGE_CODES.ERROR.INVALID_USER, 401);
    }

    req.user = {
      id: user._id,
      role: user.role,
      profileId: user.profileId._id,
      profile: user.profileId
    };
    
    next();
  } catch (err) {
    return error(res, MESSAGE_CODES.ERROR.INVALID_TOKEN, 401);
  }
};

export const requireRole = (roles) => {
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