 const nif_valido = (nif) => {
  if (!nif) return false;

  nif = nif.toUpperCase().trim();

  const letras = "TRWAGMYFPDXBNJZSQVHLCKE";
  const nifRegEx = /^[0-9]{8}[A-Z]$/;
  const nieRegEx = /^[XYZ][0-9]{7}[A-Z]$/;

  // --- DNI ---
  if (nifRegEx.test(nif)) {
    const numero = parseInt(nif.substring(0, 8), 10);
    const letraEsperada = letras[numero % 23];
    return letraEsperada === nif[8];
  }

  // --- NIE ---
  if (nieRegEx.test(nif)) {
    let numero = nif;
    if (nif[0] === "X") numero = "0" + nif.substring(1);
    else if (nif[0] === "Y") numero = "1" + nif.substring(1);
    else if (nif[0] === "Z") numero = "2" + nif.substring(1);

    const num = parseInt(numero.substring(0, 8), 10);
    const letraEsperada = letras[num % 23];
    return letraEsperada === nif[8];
  }

  return false;
};

export default nif_valido;