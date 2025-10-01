import Professional from '../models/professionals.model.js';
import validateEmail from '../utils/validateEmail.js';
import getRandomColor from '../utils/assignColor.js';
import User from '../models/User.model.js';
import nif_valido from '../utils/validateDNI.js';
import { MESSAGE_CODES, VALIDATION_CODES } from '../utils/messageCodes.js';
import { success, error, validationError } from '../middlewares/responseHandler.js';

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
      imageUrl,
    } = req.body || {};

    // 1) Validación acumulando errores
    const validationErrors = [];

    if (!firstName || typeof firstName !== 'string') {
      validationErrors.push({
        field: 'firstName',
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (!lastName || typeof lastName !== 'string') {
      validationErrors.push({
        field: 'lastName',
        code: VALIDATION_CODES.NAME_MUST_BE_STRING,
      });
    }
    if (!dni) {
      validationErrors.push({ field: 'dni', code: VALIDATION_CODES.FORM_FIELDS_REQUIRED });
    }
    if (firstName && (firstName.trim().length < 2 || firstName.trim().length > 50)) {
      validationErrors.push({
        field: 'firstName',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }
    if (lastName && (lastName.trim().length < 2 || lastName.trim().length > 50)) {
      validationErrors.push({
        field: 'lastName',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!profession || profession.trim().length < 2) {
      validationErrors.push({
        field: 'profession',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2 },
      });
    }

    if (specialty && specialty.length > 100) {
      validationErrors.push({
        field: 'specialty',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 0, max: 100 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({
        field: 'email',
        code: VALIDATION_CODES.EMAIL_INVALID_FORMAT,
      });
    }
    if (!nif_valido(dni)) {
      validationErrors.push({ field: 'dni', code: VALIDATION_CODES.DNI_INVALID_FORMAT });
    }
    if (professionLicenceNumber && !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)) {
      validationErrors.push({
        field: 'professionLicenceNumber',
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const existingEmail = await Professional.findOne({ email: normalizedEmail });
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
      // 1. Crear el profesional sin userId
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

      // 2. Crear usuario automáticamente - El middleware del modelo se encarga del hash
      console.log(`🔑 Creating professional user with password: "${dni}"`);

      const user = new User({
        email,
        password: dni, // Sin hashear, que lo haga el middleware
        role: 'professional',
        profileId: professional._id,
        profileModel: 'Professional',
        isActive: true,
      });
      await user.save();

      console.log(`✅ Professional user created with email: ${email}`);

      // 3. Actualizar profesional con referencia al usuario
      await Professional.findByIdAndUpdate(professional._id, { userId: user._id });

      // 4. Obtener profesional actualizado para la respuesta
      const updatedProfessional = await Professional.findById(professional._id);
      console.log(`User created successfully for professional: ${user.email}`);

      // 5. Responder con éxito incluyendo credenciales
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
  } catch (e) {
    // Error inesperado
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
    // Populate completo del usuario asociado (sin password por seguridad)
    const professionals = await Professional.find({ active: true }).populate('userId', '-password');
    // Devolvemos éxito con sobre estandarizado
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

export const deleteProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalDelete = await Professional.findById(id);

    if (!professionalDelete) {
      return error(
        res,
        MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND || 'Professional not found',
        404
      );
    }

    professionalDelete.active = !professionalDelete.active;
    await professionalDelete.save();

    return success(res, professionalDelete, MESSAGE_CODES.SUCCESS.PROFESSIONAL_DELETED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

export const getEditProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalEdit = await Professional.findOne({ _id: id, active: true });
    if (!professionalEdit) {
      return error(
        res,
        MESSAGE_CODES.ERROR.PROFESSIONAL_NOT_FOUND || 'Professional not found',
        404
      );
    }

    return success(res, professionalEdit, MESSAGE_CODES.SUCCESS.PROFESSIONALS_RETRIEVED, 200);
  } catch (e) {
    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e?.message || 'Unexpected error'
    );
  }
};

export const putEditProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      profession,
      specialty,
      email,
      professionLicenceNumber,
      dni,
      imageUrl,
    } = req.body || {};

    const isValidObjectId = id => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
    if (!id || !isValidObjectId(id)) {
      return validationError(res, [{ field: 'id', code: VALIDATION_CODES.INVALID_ID }], 400);
    }
    const validationErrors = [];

    if (!firstName || typeof firstName !== 'string') {
      validationErrors.push({ field: 'firstName', code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    } else if (firstName.trim().length < 2 || firstName.trim().length > 50) {
      validationErrors.push({
        field: 'firstName',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!lastName || typeof lastName !== 'string') {
      validationErrors.push({ field: 'lastName', code: VALIDATION_CODES.NAME_MUST_BE_STRING });
    } else if (lastName.trim().length < 2 || lastName.trim().length > 50) {
      validationErrors.push({
        field: 'lastName',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2, max: 50 },
      });
    }

    if (!profession || typeof profession !== 'string' || profession.trim().length < 2) {
      validationErrors.push({
        field: 'profession',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 2 },
      });
    }

    if (specialty && (typeof specialty !== 'string' || specialty.length > 100)) {
      validationErrors.push({
        field: 'specialty',
        code: VALIDATION_CODES.NAME_MIN_LENGTH,
        meta: { min: 0, max: 100 },
      });
    }

    if (!email || !validateEmail(email)) {
      validationErrors.push({ field: 'email', code: VALIDATION_CODES.EMAIL_INVALID_FORMAT });
    }
    if (!dni || !nif_valido(dni)) {
      validationErrors.push({ field: 'dni', code: VALIDATION_CODES.DNI_INVALID_FORMAT });
    }

    if (professionLicenceNumber && !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)) {
      validationErrors.push({
        field: 'professionLicenceNumber',
        code: VALIDATION_CODES.NAME_INVALID_CHARACTERS,
      });
    }

    if (validationErrors.length > 0) {
      return validationError(res, validationErrors, 400);
    }

    const existingProfessional = await Professional.findById(id);
    if (!existingProfessional) {
      return validationError(
        res,
        [{ field: 'id', code: VALIDATION_CODES.PROFESSIONAL_NOT_FOUND }],
        404
      );
    }

    const emailExists = await Professional.findOne({
      email: email.trim(),
      _id: { $ne: id }, // Excluimos al profesional actual
    });
    if (emailExists) {
      return validationError(
        res,
        [{ field: 'email', code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }],
        409
      );
    }

    const existingDni = await Professional.findOne({
      dni: dni.trim(),
      _id: { $ne: id }, // Excluimos al profesional actual
    });

    if (existingDni) {
      return validationError(
        res,
        [{ field: 'dni', code: VALIDATION_CODES.DNI_ALREADY_EXISTS }],
        409
      );
    }

    const updatedProfessional = await Professional.findByIdAndUpdate(
      id,
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profession: profession.trim(),
        specialty: specialty ? specialty.trim() : '',
        email: email.trim(),
        dni: dni.trim(),
        professionLicenceNumber: professionLicenceNumber ? professionLicenceNumber.trim() : '',
        ...(imageUrl && { imageUrl: imageUrl.trim() }),
      },
      { new: true, runValidators: false }
    );

    return success(res, updatedProfessional, MESSAGE_CODES.SUCCESS.PROFESSIONAL_UPDATED, 200);
  } catch (e) {
    console.error('Error en putEditProfessional:', e);

    if (e?.code === 11000 && e?.keyPattern?.email) {
      return validationError(
        res,
        [{ field: 'email', code: VALIDATION_CODES.EMAIL_ALREADY_EXISTS }],
        409
      );
    }

    return error(
      res,
      MESSAGE_CODES.ERROR.INTERNAL_SERVER_ERROR,
      500,
      e.message || 'Unexpected error'
    );
  }
};
