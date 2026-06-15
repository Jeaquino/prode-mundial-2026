'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('Estadios', [

      // 🇺🇸 Estados Unidos
      { nombre: 'Estadio Dallas', ciudad: 'Dallas', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Los Ángeles', ciudad: 'Los Ángeles', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Bahía de San Francisco', ciudad: 'Bahía de San Francisco', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Nueva York Nueva Jersey', ciudad: 'Nueva York / Nueva Jersey', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Boston', ciudad: 'Boston', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Filadelfia', ciudad: 'Filadelfia', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Atlanta', ciudad: 'Atlanta', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Seattle', ciudad: 'Seattle', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Miami', ciudad: 'Miami', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Kansas City', ciudad: 'Kansas City', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Houston', ciudad: 'Houston', pais: 'Estados Unidos', createdAt: now, updatedAt: now },

      // 🇲🇽 México
      { nombre: 'Estadio Ciudad de México', ciudad: 'Ciudad de México', pais: 'México', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Guadalajara', ciudad: 'Guadalajara', pais: 'México', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Monterrey', ciudad: 'Monterrey', pais: 'México', createdAt: now, updatedAt: now },

      // 🇨🇦 Canadá
      { nombre: 'BC Place Vancouver', ciudad: 'Vancouver', pais: 'Canadá', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Toronto', ciudad: 'Toronto', pais: 'Canadá', createdAt: now, updatedAt: now }

    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Estadios', null, {});
  }
};
