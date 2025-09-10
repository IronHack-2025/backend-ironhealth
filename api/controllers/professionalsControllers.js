import Professional from '../models/Professionals.model.js'
import validateEmail from '../utils/validateEmail.js';

export const addProfessional = async (req, res) => {
try {
    const { firstName, lastName, profession, specialty, email, professionLicenceNumber } = req.body;

// Validar campos obligatorios
 if (!firstName || firstName.trim().length < 2 || firstName.trim().length > 50) {
      return res.status(400).json({ error: "El nombre es obligatorio y debe tener entre 2 y 50 caracteres." });
    }
 if (!lastName || lastName.trim().length < 2 || lastName.trim().length > 50) {
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
        firstName,
        lastName,
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

export const getAllProfessionals = async(req, res) => {
    try {
        const professional = await Professional.find();
        res.status(200).json(professional)
    } catch (err){
        res.status(500).json({ error: 'Error al obtener la lista de profesionales'})
    }
}