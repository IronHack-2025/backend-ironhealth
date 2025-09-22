// Respuestas consistentes para toda la API
import { MESSAGE_CODES } from "../utils/messageCodes.js";

// Éxito: { success:true, messageCode, data }
export const success = (
  res,
  data,
  messageCode,
  status = 200
) => {
  return res.status(status).json({ success: true, messageCode, data });
};

// Error del servidor u otros: { success:false, messageCode, details }
export const error = (
  res,
  messageCode,
  status = 500,
  details = null
) => {
  return res.status(status).json({ success: false, messageCode, details });
};

// Error de validación: { success:false, messageCode:'VALIDATION_FAILED', details:[{field?,code,meta?},...] }
export const validationError = (res, errors, status = 400) => {
  return res.status(status).json({
    success: false,
    messageCode: MESSAGE_CODES.ERROR.VALIDATION_FAILED,
    details: errors,
  });
};
