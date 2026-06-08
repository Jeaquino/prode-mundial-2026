const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../data/fixture.txt');
const outputPath = path.join(__dirname, '../data/fixture_parsed.json');

const monthMap = {
  'enero': 0,
  'febrero': 1,
  'marzo': 2,
  'abril': 3,
  'mayo': 4,
  'junio': 5,
  'julio': 6,
  'agosto': 7,
  'septiembre': 8,
  'octubre': 9,
  'noviembre': 10,
  'diciembre': 11
};

const synonyms = {
  'república de corea': 'Corea del Sur',
  'corea del sur': 'Corea del Sur',
  'catar': 'Qatar',
  'qatar': 'Qatar',
  'arabia saudí': 'Arabia Saudita',
  'arabia saudita': 'Arabia Saudita',
  'estados unidos': 'Estados Unidos',
  'usa': 'Estados Unidos',
  'nueva york nueva jersey': 'Nueva York / Nueva Jersey',
  'nueva york / nueva jersey': 'Nueva York / Nueva Jersey',
  'rd congo': 'RD Congo',
  'republica checa': 'República Checa',
  'república checa': 'República Checa',
  'corea': 'Corea del Sur',
  'sudáfrica': 'Sudáfrica',
  'sudafrica': 'Sudáfrica',
  'curazao': 'Curazao',
  'pais' : 'País' // placeholder
};

function normalizeName(name) {
  if (!name) return name;
  const n = name.trim().toLowerCase();
  if (synonyms[n]) return synonyms[n];
  // capitalize words
  return name.trim();
}

function parse() {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const results = [];
  let currentDate = null; // {day,month,year}

  const dateHeaderRegex = /([0-9]{1,2}) de ([a-zA-ZñÑáéíóúÁÉÍÓÚ]+) ([0-9]{4})/i;
  const fullDateHeaderRegex = /[A-Za-záéíóúÁÉÍÓÚ]+,?\s*([0-9]{1,2}) de ([a-zA-ZñÑáéíóúÁÉÍÓÚ]+) ([0-9]{4})/i;

  lines.forEach(line => {
    // Check if line is a date header
    const dateMatch = line.match(fullDateHeaderRegex);
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const monthName = dateMatch[2].toLowerCase();
      const year = parseInt(dateMatch[3], 10);
      const month = monthMap[monthName];
      if (month === undefined) {
        console.warn('Mes no reconocido:', monthName);
      }
      currentDate = { day, month, year };
      return;
    }

    // Otherwise, assume it's a match line like "15:00 - México v Sudáfrica – Grupo A - Estadio Ciudad de México"
    const timeMatch = line.match(/^([0-9]{1,2}:[0-9]{2})/);
    if (!timeMatch || !currentDate) return;

    const time = timeMatch[1];
    // Remove time and separator
    let rest = line.replace(timeMatch[0], '').trim();
    rest = rest.replace(/^[-–—\s]+/, '');

    // Find 'Estadio' position
    const estadioIdx = rest.toLowerCase().indexOf('estadio');
    let estadio = null;
    if (estadioIdx !== -1) {
      estadio = rest.substring(estadioIdx).replace(/^estadio\s*/i, '').trim();
      rest = rest.substring(0, estadioIdx).trim();
    }

    // Find 'Grupo' position
    const grupoMatch = rest.match(/grupo\s*([A-Z0-9]+)/i);
    let grupo = null;
    if (grupoMatch) {
      grupo = grupoMatch[1];
      rest = rest.replace(grupoMatch[0], '').trim();
    }

    // Now rest should contain "México v Sudáfrica" or similar
    const vsMatch = rest.match(/(.+) v (.+)/i);
    if (!vsMatch) return;
    const localRaw = vsMatch[1].trim();
    const visitanteRaw = vsMatch[2].trim();

    const local = normalizeName(localRaw);
    const visitante = normalizeName(visitanteRaw);

    // Build date-time
    const [hh, mm] = time.split(':').map(n => parseInt(n, 10));
    const dt = new Date(currentDate.year, currentDate.month, currentDate.day, hh, mm, 0);

    results.push({
      fecha: dt.toISOString(),
      grupo: grupo || null,
      local,
      visitante,
      estadio: estadio || null
    });
  });

  fs.writeFileSync(outputPath, JSON.stringify({ partidos: results }, null, 2), 'utf-8');
  console.log('Escrito', outputPath, 'partidos:', results.length);
}

parse();
