import sanitizeHtml from 'sanitize-html';

const validateNotes = (req, res, next) => {
    if (req.body.notes) {
        const originalNotes = req.body.notes;
        
        // Sanitizar HTML potencialmente peligroso
        const sanitizedNotes = sanitizeHtml(originalNotes, {
            allowedTags: [], // No permitir ningún tag HTML
            allowedAttributes: {}
        });
        
        // Verificar si había contenido HTML
        if (originalNotes !== sanitizedNotes) {
            return res.status(400).json({ 
                error: "Las notas no pueden contener código HTML." 
            });
        }
        
        // Validar longitud después de verificar HTML
        if (sanitizedNotes.length > 500) {
            return res.status(400).json({ 
                error: "Las notas no pueden exceder los 500 caracteres." 
            });
        }
        
        req.body.notes = sanitizedNotes;
    }
    
    next();
};

export { validateNotes };