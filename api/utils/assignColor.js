function getRandomColor() {
  // Paletas extendidas
  const hueRanges = [
    [180, 260], // azules ampliados (cyan → indigo)
    [160, 200], // cian / teal
    [230, 300], // púrpuras ampliados (indigo → magenta)
    [300, 20], // granates/rojos profundos (wrap around)
  ];

  const slateRange = [200, 250];

  // Selección aleatoria de gama
  const rangeIndex = Math.floor(Math.random() * (hueRanges.length + 2));

  let hue, saturation, lightness;

  if (rangeIndex < hueRanges.length) {
    const [min, max] = hueRanges[rangeIndex];

    if (min <= max) {
      hue = min + Math.random() * (max - min);
    } else {
      // wrap-around
      const span = 360 - min + max;
      hue = (min + Math.random() * span) % 360;
    }

    saturation = 70 + Math.random() * 20; // 70–90%
    lightness = 18 + Math.random() * 37; // 18–55%
  } else if (rangeIndex === hueRanges.length) {
    // Slates
    const [min, max] = slateRange;
    hue = min + Math.random() * (max - min);
    saturation = 10 + Math.random() * 20; // 10–30%
    lightness = 15 + Math.random() * 25; // 15–40%
  } else {
    // Grises/Negros
    hue = 0;
    saturation = 0;
    lightness = 6 + Math.random() * 40; // 6–45%
  }

  return `hsl(${hue.toFixed(0)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}

export default getRandomColor;
