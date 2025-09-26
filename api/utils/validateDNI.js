const nif_valido = (nif) => {
  if (!nif) return false;

  nif = nif.toUpperCase().trim();

  const validPatterns = [
    /^[0-9]{8}[A-Z]$/,               // 8 números + letra
    /^[XYZ][0-9]{7}[A-Z]$/           // NIE: letra + 7 números + letra
  ];

  return validPatterns.some(pattern => pattern.test(nif));
};

export default nif_valido;