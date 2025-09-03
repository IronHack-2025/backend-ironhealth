import { Patient } from "../models/Patient.model.js";

export const postNewPatient = async () => {
    const { firstName, lastName, email, phone, birthDate } = req.body;
    
    try{
        const patient = await Patient.create({
        firstName,
        lastName,
        email,
        phone,
        birthDate

    })

    console.log(`Patient added succesfully: ${patient}`)
    } catch (error){
        console.error(error)
    }
    
}