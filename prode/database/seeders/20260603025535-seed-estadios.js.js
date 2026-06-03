'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('Estadios', [

      // 🇺🇸 Estados Unidos
      { nombre: 'MetLife Stadium', ciudad: 'New York/New Jersey', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'AT&T Stadium', ciudad: 'Dallas', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'SoFi Stadium', ciudad: 'Los Angeles', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Levi\'s Stadium', ciudad: 'San Francisco Bay Area', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Lumen Field', ciudad: 'Seattle', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Mercedes-Benz Stadium', ciudad: 'Atlanta', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Gillette Stadium', ciudad: 'Boston', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Hard Rock Stadium', ciudad: 'Miami', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Arrowhead Stadium', ciudad: 'Kansas City', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'NRG Stadium', ciudad: 'Houston', pais: 'Estados Unidos', createdAt: now, updatedAt: now },
      { nombre: 'Lincoln Financial Field', ciudad: 'Philadelphia', pais: 'Estados Unidos', createdAt: now, updatedAt: now },

      // 🇲🇽 México
      { nombre: 'Estadio Azteca', ciudad: 'Ciudad de México', pais: 'México', createdAt: now, updatedAt: now },
      { nombre: 'Estadio BBVA', ciudad: 'Monterrey', pais: 'México', createdAt: now, updatedAt: now },
      { nombre: 'Estadio Akron', ciudad: 'Guadalajara', pais: 'México', createdAt: now, updatedAt: now },

      // 🇨🇦 Canadá
      { nombre: 'BMO Field', ciudad: 'Toronto', pais: 'Canadá', createdAt: now, updatedAt: now },
      { nombre: 'BC Place', ciudad: 'Vancouver', pais: 'Canadá', createdAt: now, updatedAt: now }

    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Estadios', null, {});
  }
};
