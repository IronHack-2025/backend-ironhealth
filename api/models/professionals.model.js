import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';

const professions = fs.readFileSync(path.resolve('api/data/professions.json'));
const professionsData = JSON.parse(professions);

const { Schema } = mongoose;
const ProfessionalSchema = new Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    profession: { type: String, required: true, enum: professionsData.professions.map(p => p.code) },
    specialty: { type: String, required: false, enum: ['', ...professionsData.professions.flatMap(p => p.specialty.map(s => s['specialty-code']))] },
    email: { type: String, required: true, unique: true },
    professionLicenceNumber: { type: String, required: false }
}, { timestamps: true });

export default mongoose.model("Professional", ProfessionalSchema);

//faltan validaciones y demas