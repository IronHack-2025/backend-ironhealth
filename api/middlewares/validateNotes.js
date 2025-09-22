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
      return validationError(
        res,
        [{ field: "notes", code: VALIDATION_CODES.NOTES_HTML_NOT_ALLOWED }],
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
            code: VALIDATION_CODES.NOTES_TOO_LONG,
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
