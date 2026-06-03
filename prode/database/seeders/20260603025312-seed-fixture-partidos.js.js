'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const now = new Date();

    // Traer todos los equipos cargados
    const equipos = await queryInterface.sequelize.query(
      `SELECT id, grupo FROM equipos ORDER BY grupo`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Agrupar equipos por grupo
    const grupos = {};

    equipos.forEach(eq => {
      if (!grupos[eq.grupo]) {
        grupos[eq.grupo] = [];
      }
      grupos[eq.grupo].push(eq);
    });

    const partidos = [];

    let fechaBase = new Date();

    // Generar partidos todos contra todos por grupo
    Object.keys(grupos).forEach(grupo => {
      const equiposGrupo = grupos[grupo];

      for (let i = 0; i < equiposGrupo.length; i++) {
        for (let j = i + 1; j < equiposGrupo.length; j++) {

          partidos.push({
            equipo_local_id: equiposGrupo[i].id,
            equipo_visitante_id: equiposGrupo[j].id,
            estadio_id: null, // opcional
            fecha_hora: new Date(fechaBase),
            fase: 'GRUPOS',
            goles_local: null,
            goles_visitante: null,
            estado: 'PENDIENTE',
            createdAt: now,
            updatedAt: now
          });

          // Incrementar fecha para separar partidos
          fechaBase.setHours(fechaBase.getHours() + 2);
        }
      }
    });

    await queryInterface.bulkInsert('Partidos', partidos, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Partidos', {
      fase: 'GRUPOS'
    }, {});
  }
};