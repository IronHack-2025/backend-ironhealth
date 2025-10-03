// scripts/testEmail.mjs
// Script para probar el servicio de email desde consola.
// Uso: node --env-file=.env scripts/testEmail.mjs TU@EMAIL.COM
import { emailService } from '../api/services/email/index.js';

function makeBigString(mb) {
  const size = Math.max(1, Number(mb)) * 1024 * 1024; // bytes
  return 'A'.repeat(size); // string ≈ size bytes (UTF-8)
}

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO;
  if (!to) {
    // En vez de process.exit(1), lanzamos error para que lo capture el .catch
    throw new Error('Uso: node --env-file=.env scripts/testEmail.mjs TU@EMAIL.COM');
  }

  console.log('EMAIL_ENABLED              =', process.env.EMAIL_ENABLED);
  console.log('EMAIL_DEV_WHITELIST        =', process.env.EMAIL_DEV_WHITELIST);
  console.log('EMAIL_MAX_TOTAL_SIZE_MB    =', process.env.EMAIL_MAX_TOTAL_SIZE_MB);

  // PRUEBA A: bienvenida (pasa si to está en whitelist o EMAIL_ENABLED=true)
  const resp = await emailService.sendTemplate({
    template: 'patient_welcome',
    to,
    data: {
      firstName: 'Prueba',
      portalUrl: process.env.PORTAL_URL || 'http://localhost:5173',
    },
  });
  console.log('✅ Bienvenida enviada. id =', resp?.id);

  // PRUEBA B: adjunto grande para probar el límite (p.ej., 9 MB)
  // Valor > EMAIL_MAX_TOTAL_SIZE_MB para forzar el error.
  const bigStr = makeBigString(9);
  try {
    const resp2 = await emailService.send({
      to,
      subject: 'Test adjunto grande',
      text: 'Esto debería fallar si supera el límite configurado',
      attachments: [
        {
          filename: 'grande.txt',
          content: bigStr, // string grande
        },
      ],
    });
    console.log(
      '⚠️ Se envió con adjunto grande (revisa si esperabas que fallara): id =',
      resp2?.id
    );
  } catch (e) {
    if (e?.code === 'EMAIL_TOO_LARGE') {
      console.log('✅ Bloqueado por tamaño como se esperaba:', e.message);
    } else {
      console.error('❌ Error distinto al esperado:', e?.message);
      throw e; // deja que lo capture el .catch final
    }
  }
}

// Patrón sin process.exit(): si hay error, marcamos exitCode y listo
main().catch(err => {
  console.error('❌ Error enviando correo:', err?.message || err);
  console.error(err);
  process.exitCode = 1;
});
