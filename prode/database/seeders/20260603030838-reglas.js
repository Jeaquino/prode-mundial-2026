'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    const now = new Date();

    await queryInterface.bulkInsert('PuntuacionReglas', [

      {
        descripcion: 'Acierto de resultado exacto',
        puntos: 3,
        createdAt: now,
        updatedAt: now
      },
      {
        descripcion: 'Acierto de ganador/empate',
        puntos: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        descripcion: 'Partido errado',
        puntos: 0,
        createdAt: now,
        updatedAt: now
      }

    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PuntuacionReglas', null, {});
  }
};
``