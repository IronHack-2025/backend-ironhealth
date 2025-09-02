import { Patient } from "../models/Patient.model";

export const postNewPatient = async () => {
    const { firstName, lastName, email, phone, birthDay } = req.body;
    
    try{
        const patient = await Patient.create({
        firstName,
        lastName,
        email,
        phone,
        birthDay

    })
    } catch (error){
        console.error(error)
    }
    
}