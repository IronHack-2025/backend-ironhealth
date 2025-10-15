import { v2 as cloudinary } from 'cloudinary';

export const postSignature = (req, res) => {
  try {
    const paramsToSign = { ...req.body };
    const timestamp = Math.round(Date.now() / 1000);
    paramsToSign.timestamp = timestamp;

    console.log('📩 Cloudinary params:', req.body);

    delete paramsToSign.api_key;
    delete paramsToSign.signature;
    delete paramsToSign.resource_type;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({ signature, timestamp });
  } catch (err) {
    console.error('Error generando firma:', err);
    res.status(500).json({ error: 'Error generando firma', details: err.message });
  }
};
