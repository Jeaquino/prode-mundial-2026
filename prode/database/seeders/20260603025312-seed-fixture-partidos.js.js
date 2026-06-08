'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Leer el archivo JSON generado desde fixture.txt
    const jsonPath = path.join(__dirname, '../../data/fixture_parsed.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Traer todos los equipos y estadios cargados
    const equipos = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM equipos ORDER BY nombre`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const estadios = await queryInterface.sequelize.query(
      `SELECT id, nombre FROM estadios ORDER BY nombre`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Crear mapas de búsqueda (lowercase)
    const equiposMap = {};
    equipos.forEach(eq => {
      equiposMap[eq.nombre.trim().toLowerCase()] = eq.id;
    });

    function normalizeText(raw) {
      if (!raw) return '';
      return raw
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }

    function normalizeStadiumName(raw) {
      let value = normalizeText(raw);
      value = value.replace(/^estadio\s+/i, '').trim();

      const stadionSynonyms = {
        'bahia de san francisco bay': 'bahia de san francisco',
        'bahia de san francisco': 'bahia de san francisco',
        'nueva york / nueva jersey': 'nueva york nueva jersey',
        'nueva york nueva jersey': 'nueva york nueva jersey'
      };

      return stadionSynonyms[value] || value;
    }

    const estadiosMap = {};
    estadios.forEach(est => {
      estadiosMap[normalizeStadiumName(est.nombre)] = est.id;
    });

    const partidos = [];

    // Procesar fixture generado (fixture_parsed.json)
    if (jsonData.partidos && Array.isArray(jsonData.partidos)) {
      const synonyms = {
        'república de corea': 'corea del sur',
        'corea del sur': 'corea del sur',
        'república checa': 'república checa',
        'qatar': 'qatar',
        'nueva york nueva jersey': 'nueva york nueva jersey',
        'rd congo': 'rd congo',
        'ri de irán': 'irán',
        'irak': 'irak'
      };

      function cleanName(raw) {
        if (!raw) return '';
        // eliminar separadores extra y contenido después de guiones largos
        let v = raw.split(/[–—-]/)[0].trim();
        v = v.replace(/\s+–+\s*$/, '').trim();
        v = v.replace(/\s+\-+\s*$/, '').trim();
        const key = normalizeText(v);
        return synonyms[key] || v;
      }

      jsonData.partidos.forEach(p => {
        const fecha = new Date(p.fecha);
        const localName = cleanName(p.local).toLowerCase();
        const visitanteName = cleanName(p.visitante).toLowerCase();
        const estadioName = normalizeStadiumName(p.estadio);

        const equipoLocalId = equiposMap[localName];
        const equipoVisitanteId = equiposMap[visitanteName];
        const estadioId = estadiosMap[estadioName];

        if (equipoLocalId && equipoVisitanteId) {
          partidos.push({
            equipo_local_id: equipoLocalId,
            equipo_visitante_id: equipoVisitanteId,
            estadio_id: estadioId || null,
            fecha_hora: fecha,
            fase: 'GRUPOS',
            goles_local: null,
            goles_visitante: null,
            estado: 'PENDIENTE',
            createdAt: now,
            updatedAt: now
          });
        } else {
          console.warn('Equipo no encontrado, omitiendo partido:', p.local, p.visitante);
        }
      });
    }

    if (partidos.length > 0) {
      await queryInterface.bulkInsert('Partidos', partidos, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partidos', {
      fase: 'GRUPOS'
    }, {});
  }
};