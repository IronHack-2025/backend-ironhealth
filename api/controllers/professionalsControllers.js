import Professional from "../models/professionals.model.js";
import validateEmail from "../utils/validateEmail.js";
import getRandomColor from "../utils/assignColor.js";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import nif_valido from '../utils/validateDNI.js';
import { MESSAGE_CODES, VALIDATION_CODES } from "../utils/messageCodes.js";
import {
  success,
  error,
  validationError,
} from "../middlewares/responseHandler.js";

export const addProfessional = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      profession,
      specialty,
      email,
      dni,
      professionLicenceNumber,
    } = req.body || {};

    // 1) Validación acumulando errores
    const validationErrors = [];

    if (!firstName || typeof firstName !== "string") {
      validationErrors.push({
        field: "firstName",
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (!lastName || typeof lastName !== "string") {
      validationErrors.push({
        field: "lastName",
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (!dni) {
        validationErrors.push({ field: 'dni', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED });
    }
    if (
      firstName &&
      (firstName.trim().length < 2 || firstName.trim().length > 50)
    ) {
      validationErrors.push({
        field: "firstName",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }
    if (
      lastName &&
      (lastName.trim().length < 2 || lastName.trim().length > 50)
    ) {
      validationErrors.push({
        field: "lastName",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!profession || profession.trim().length < 2) {
      validationErrors.push({
        field: "profession",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2 },
      });
    }

    if (specialty && specialty.length > 100) {
      validationErrors.push({
        field: "specialty",
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 0, max: 100 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({
        field: "email",
        code: VALIDATION_CODES.EMAIL_INVALID_FORMAT,
      });
    }
    if ( !nif_valido(dni)) {
        validationErrors.push({ field: 'dni', code: VALIDATION_CODES.DNI_INVALID_FORMAT });
    }
    if (
      professionLicenceNumber &&
      !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)
    ) {
      validationErrors.push({
        field: "professionLicenceNumber",
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

       try {
        const existingEmail = await Professional.findOne({ email });
        if (existingEmail) {
            validationErrors.push({ field: 'email', code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS });
        }
        
        const existingDni = await Professional.findOne({ dni });
        if (existingDni) {
            validationErrors.push({ field: 'dni', code: VALIDATION_CODES.DNI_ALREADY_EXISTS });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            validationErrors.push({ field: 'email', code: VALIDATION_CODES.USER_ALREADY_EXISTS });
        }
        
    } catch (err) {
        console.error('Error checking existing records:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR);
    }

    if (validationErrors.length) {
      // 400: devolvemos TODOS los errores de validación
      return validationError(res, validationErrors);
    }
    try {
        // 1. Crear profesional sin userId primero
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

        const savedProfessional = await newProfessional.save();
        console.log(`Professional added successfully: ${savedProfessional}`);

        // 2. Crear usuario automáticamente
        const hashedPassword = await bcrypt.hash(dni, 12);
        
        const user = new User({
            email,
            password: hashedPassword,
            role: 'professional',
            profileId: savedProfessional._id,
            profileModel: 'Professional'
        });
        await user.save();
        
        // 3. Actualizar profesional con referencia al usuario
        await Professional.findByIdAndUpdate(savedProfessional._id, { userId: user._id });
        
        // 4. Obtener profesional actualizado para la respuesta
        const updatedProfessional = await Professional.findById(savedProfessional._id);
        console.log(`User created successfully for professional: ${user.email}`);

        // 5. Responder con éxito incluyendo credenciales
        return success(res, {
            professional: updatedProfessional,
            authCreated: true,
            credentials: {
                email: user.email,
                defaultPassword: dni
            }
        }, MESSAGE_CODES.SUCCESS.PROFESSIONAL_CREATED, 201);
        
    } catch (err) {
        console.error('Error creating professional:', err);
        return error(res, MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR, 500, err.message);
    }
} catch (e) {

    // Error inesperado
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || "Unexpected error"
    );
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
     const professionals = await Professional.find().populate('userId', 'email role');
    // Devolvemos éxito con sobre estandarizado
    return success(
      res,
      professionals,
      MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED,
      200
    );
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || "Unexpected error"
    );
  }
};
