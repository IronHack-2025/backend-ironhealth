import Professional from '../models/Professionals.model.js';
import validateEmail from '../utils/validateEmail.js';

export const addProfessional = async (req, res) => {
try {
    const { name, surname, profession, specialty, email, professionLicenceNumber } = req.body;

// Validar campos obligatorios
 if (!name || name.trim().length < 2 || name.trim().length > 50) {
      return res.status(400).json({ error: "El nombre es obligatorio y debe tener entre 2 y 50 caracteres." });
    }
 if (!surname || surname.trim().length < 2 || surname.trim().length > 50) {
      return res.status(400).json({ error: "El apellido es obligatorio y debe tener entre 2 y 50 caracteres." });
    }
   if (!profession || profession.trim().length < 2) {
      return res.status(400).json({ error: "La profesión es obligatoria y debe tener al menos 2 caracteres." });
    }
      if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: "El email es obligatorio y debe tener un formato válido." });
    }
     if (specialty && specialty.length > 100) {
      return res.status(400).json({ error: "La especialidad no puede superar los 100 caracteres." });
    }
    if (professionLicenceNumber && !/^[a-zA-Z0-9]+$/.test(professionLicenceNumber)) {
      return res.status(400).json({ error: "El número de licencia solo puede contener letras y números." });
    }

     const existingProfessional = await Professional.findOne({ email });
    if (existingProfessional) {
      return res.status(400).json({ error: "Ya existe un profesional registrado con este email." });
    }

    const newProfessional = new Professional({
        name,
        surname,
        profession,
        specialty,
        email,
        professionLicenceNumber
    });

   
   
    await newProfessional.save()
        .then(professional => res.status(201).json(professional))
        .catch(err => res.status(400).json({ error: 'Error saving professional', details: err }));
    
   
} catch (error) {
    res.status(500).json({ error: 'Internal server error', details: error });
}
};