import path from 'path';
import fs from 'fs';

export const postNewEmail = (req, res) => {

    // desestructuración de objetos, usemosla siempre que podamos
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // TODO: Valoremos si en el futuro usar express-validator
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
    }

    const filePath = path.join(process.cwd(), "waitlist.txt");
    fs.appendFileSync(filePath, email + "\n");

    res.json({ message: "Email guardado correctamente" });

}