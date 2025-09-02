import mongoose from "mongoose";

const { Schema } = mongoose;
const ProfessionalSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    profession: { type: String, required: true },
    speciality: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    professionLicenceNumber: { type: String, required: false }
}, { timestamps: true });

export default mongoose.model("Professional", ProfessionalSchema);

//faltan validaciones y demas