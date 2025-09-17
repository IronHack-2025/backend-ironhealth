import { v2 as cloudinary } from "cloudinary";
export const getSignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const folder = req.query.folder || "patients";
    const source = "uw"; // Cloudinary widget usa source=uw

    const paramsToSign = {
      folder,
      source,
      timestamp,
      // upload_preset, // Solo inclúyelo si el widget lo envía en el string to sign
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );
    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error generando firma" });
  }
};