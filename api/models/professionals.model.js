import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import nif_valido from "../utils/validateDNI.js";

const professions = fs.readFileSync(path.resolve("api/data/professions.json"));
const professionsData = JSON.parse(professions);

const { Schema } = mongoose;
const ProfessionalSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profession: { type: String, required: true, enum: professionsData.professions.map(p => p.code) },
    specialty: { type: String, required: false, enum: ['', ...professionsData.professions.flatMap(p => p.specialty.map(s => s['specialty-code']))] },
    email: { type: String, required: true, unique: true },
     dni: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: {
                validator: nif_valido,
                message: props => `${props.value} is not a valid DNI/NIE!`
            }
        },
    professionLicenceNumber: { type: String, required: false },
    color: { type: String, required: true },
    imageUrl: {
        type: String,
        required: true,
        default: 'https://res.cloudinary.com/dt7uhxeuk/image/upload/v1758209486/professionals/jqluodx877l67l1gmktx.png'
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        unique: true,
        sparse: true // Permite null y mantiene unicidad para valores no null
    },
}, { timestamps: true });

export default mongoose.model("Professional", ProfessionalSchema);
