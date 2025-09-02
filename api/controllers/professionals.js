
import { Professional } from '../models/professionals.model.js';

export const addProfessional = async (req, res) => {
try {
    const { name, surname, profession, speciality, email, professionLicenceNumber } = req.body;

    const newProfessional = new Professional({
        name,
        surname,
        profession,
        speciality,
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