import sanitizeHtml from "sanitize-html";
import { validationError } from "../middlewares/responseHandler.js";
import { VALIDATION_CODES } from "../utils/messageCodes.js";

const validateNotes = (req, res, next) => {
  if (req.body.notes) {
    const originalNotes = req.body.notes;

    // Sanitizar HTML potencialmente peligroso
    const sanitizedNotes = sanitizeHtml(originalNotes, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // Verificar si había contenido HTML
    if (originalNotes !== sanitizedNotes) {
      // Reusamos NAME_INVALID_CHARACTERS como placeholder; luego podemos crear un código específico NOTEs_HTML_NOT_ALLOWED
      return validationError(
        res,
        [{ field: "notes", code: VALIDATION_CODES.NAME_INVALID_CHARACTERS }],
        400
      );
    }

    // Validar longitud después de verificar HTML
    if (sanitizedNotes.length > 500) {
      return validationError(
        res,
        [
          {
            field: "notes",
            code: VALIDATION_CODES.NAME_MIN_LENGTH,
            meta: { min: 0, max: 500 },
          },
        ],
        400
      );
    }

    req.body.notes = sanitizedNotes;
  }
  next();
};

export { validateNotes };
