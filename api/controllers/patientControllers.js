import { Patient } from "../models/Patient.model.js";

export const postNewPatient = async (req, res) => {
    const { firstName, lastName, email, phone, birthDate } = req.body;


    if (!req.body) {
        return res.status(400).json({ error: 'Rellena los campos del formulario' })
    } if (
        typeof firstName !== "string" ||
        typeof lastName !== "string"
    ) {
        return res.status(400).json({ error: "El nombre y el apellido deben contener solo letras" });
    }

    if (firstName.length <= 2 || lastName.length <= 2) {
        return res.status(400).json({ error: "El nombre y el apellido deben contener 2 o más letras" });

    } if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(firstName) ||
        !/^[A-Za-zÁÉÍÓÚáéíóúÑñÇç\s]+$/.test(lastName)) {
        return res.status(400).json({ error: "El nombre y el apellido sólo pueden letras mayúsculas y minúsculas" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Por favor, introduce un email válido" });
    }

    const existingEmail = await Patient.findOne({ email });
    if (existingEmail) {
        return res.status(400).json({ error: "El email ya está registrado" });
    }

    const existingPhone = await Patient.findOne({ phone });
    if (existingPhone) {
        return res.status(400).json({ error: "El teléfono ya está registrado" });
    }

    const today = new Date()
    if (birthDate >= today) {
        return res.status(400).json({ error: 'La fecha de nacimiento no es válida' });
    }


    try {
        const patient = await Patient.create({
            firstName,
            lastName,
            email,
            phone,
            birthDate
        })

        console.log(`Patient added succesfully: ${patient}`);

        res.status(200).json(`Patient added succesfully: ${patient}`);

    } catch (error) {
        console.error(error);
        res.status(400).json(`Error registering patient`);
    }

}

export const getAllPatients = async(req, res) => {
    try {
        const patient = await Patient.find();
        res.status(200).json(patient)
    } catch (err){
        res.status(500).json({ error: 'Error al obtener la lista de pacientes'})
    }
}
