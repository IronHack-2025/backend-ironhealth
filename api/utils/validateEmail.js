// Función para validar email con reglas adicionales:
// - debe ser string
// - no espacios alrededor
// - formato local@domain.tld básico
// - local part no puede empezar/terminar con '.' y no puede contener '..'
const validateEmail = (email) => {
  if (typeof email !== 'string') return false;
  // no permitir espacios al inicio o al final
  if (email.trim() !== email) return false;

  // división local / dominio
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;

  // comprobar local part
  if (!local || local.startsWith('.') || local.endsWith('.')) return false;
  if (local.includes('..')) return false; // no puntos consecutivos

  // comprobación sencilla del dominio (al menos un punto y etiquetas no vacías)
  if (!domain || domain.startsWith('.') || domain.endsWith('.')) return false;
  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) return false; // necesita TLD
  if (domainLabels.some((lbl) => lbl.length === 0)) return false;

  // Regex final para caracteres permitidos básicos (no exhaustivo)
  const safeRegex = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return safeRegex.test(email);
};

export default validateEmail;