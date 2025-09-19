import MESSAGE_CODES from '../utils/messageCodes.js';

export const success = (res, data = null, messageCode = MESSAGE_CODES.SUCCESS.OPERATION_SUCCESS, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    messageCode,
    data
  });
};

export const error = (res, messageCode = MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, statusCode = 500, details = null) => {
  return res.status(statusCode).json({
    success: false,
    messageCode,
    details
  });
};

export const validationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    messageCode: MESSAGE_CODES.ERROR.VALIDATION_FAILED,
    details:  validationErrors
  });
};