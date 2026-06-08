'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('Equipos', [
      { nombre: 'Alemania', codigo_fifa: 'GER', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Arabia Saudita', codigo_fifa: 'KSA', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Argelia', codigo_fifa: 'ALG', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Argentina', codigo_fifa: 'ARG', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Australia', codigo_fifa: 'AUS', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Austria', codigo_fifa: 'AUT', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Bosnia y Herzegovina', codigo_fifa: 'BIH', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Brasil', codigo_fifa: 'BRA', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'Bélgica', codigo_fifa: 'BEL', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Cabo Verde', codigo_fifa: 'CPV', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Canadá', codigo_fifa: 'CAN', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Qatar', codigo_fifa: 'QAT', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Colombia', codigo_fifa: 'COL', grupo: 'K', createdAt: now, updatedAt: now },
      { nombre: 'República de Corea', codigo_fifa: 'KOR', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'Costa de Marfil', codigo_fifa: 'CIV', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Croacia', codigo_fifa: 'CRO', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'Curazao', codigo_fifa: 'CUW', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Ecuador', codigo_fifa: 'ECU', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Egipto', codigo_fifa: 'EGY', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Escocia', codigo_fifa: 'SCO', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'España', codigo_fifa: 'ESP', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Estados Unidos', codigo_fifa: 'USA', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Francia', codigo_fifa: 'FRA', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Ghana', codigo_fifa: 'GHA', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'Haití', codigo_fifa: 'HAI', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'Inglaterra', codigo_fifa: 'ENG', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'Irak', codigo_fifa: 'IRQ', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Irán', codigo_fifa: 'IRN', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Japón', codigo_fifa: 'JPN', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Jordania', codigo_fifa: 'JOR', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Marruecos', codigo_fifa: 'MAR', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'México', codigo_fifa: 'MEX', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'Noruega', codigo_fifa: 'NOR', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Nueva Zelanda', codigo_fifa: 'NZL', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Panamá', codigo_fifa: 'PAN', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'Paraguay', codigo_fifa: 'PAR', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Países Bajos', codigo_fifa: 'NED', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Portugal', codigo_fifa: 'POR', grupo: 'K', createdAt: now, updatedAt: now },
      { nombre: 'RD Congo', codigo_fifa: 'COD', grupo: 'K', createdAt: now, updatedAt: now },
      { nombre: 'República Checa', codigo_fifa: 'CZE', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'Senegal', codigo_fifa: 'SEN', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Sudáfrica', codigo_fifa: 'RSA', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'Suecia', codigo_fifa: 'SWE', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Suiza', codigo_fifa: 'SUI', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Turquía', codigo_fifa: 'TUR', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Túnez', codigo_fifa: 'TUN', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Uruguay', codigo_fifa: 'URU', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Uzbekistán', codigo_fifa: 'UZB', grupo: 'K', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Equipos', null, {});
  }
};