'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('Equipos', [

      // Grupo A
      { nombre: 'Estados Unidos', codigo_fifa: 'USA', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'México', codigo_fifa: 'MEX', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'Canadá', codigo_fifa: 'CAN', grupo: 'A', createdAt: now, updatedAt: now },
      { nombre: 'Costa Rica', codigo_fifa: 'CRC', grupo: 'A', createdAt: now, updatedAt: now },

      // Grupo B
      { nombre: 'Argentina', codigo_fifa: 'ARG', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Brasil', codigo_fifa: 'BRA', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Uruguay', codigo_fifa: 'URU', grupo: 'B', createdAt: now, updatedAt: now },
      { nombre: 'Colombia', codigo_fifa: 'COL', grupo: 'B', createdAt: now, updatedAt: now },

      // Grupo C
      { nombre: 'Francia', codigo_fifa: 'FRA', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'Alemania', codigo_fifa: 'GER', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'España', codigo_fifa: 'ESP', grupo: 'C', createdAt: now, updatedAt: now },
      { nombre: 'Portugal', codigo_fifa: 'POR', grupo: 'C', createdAt: now, updatedAt: now },

      // Grupo D
      { nombre: 'Inglaterra', codigo_fifa: 'ENG', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Países Bajos', codigo_fifa: 'NED', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Bélgica', codigo_fifa: 'BEL', grupo: 'D', createdAt: now, updatedAt: now },
      { nombre: 'Italia', codigo_fifa: 'ITA', grupo: 'D', createdAt: now, updatedAt: now },

      // Grupo E
      { nombre: 'Croacia', codigo_fifa: 'CRO', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Suiza', codigo_fifa: 'SUI', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Dinamarca', codigo_fifa: 'DEN', grupo: 'E', createdAt: now, updatedAt: now },
      { nombre: 'Suecia', codigo_fifa: 'SWE', grupo: 'E', createdAt: now, updatedAt: now },

      // Grupo F
      { nombre: 'Serbia', codigo_fifa: 'SRB', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Polonia', codigo_fifa: 'POL', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Ucrania', codigo_fifa: 'UKR', grupo: 'F', createdAt: now, updatedAt: now },
      { nombre: 'Turquía', codigo_fifa: 'TUR', grupo: 'F', createdAt: now, updatedAt: now },

      // Grupo G
      { nombre: 'Japón', codigo_fifa: 'JPN', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Corea del Sur', codigo_fifa: 'KOR', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Australia', codigo_fifa: 'AUS', grupo: 'G', createdAt: now, updatedAt: now },
      { nombre: 'Irán', codigo_fifa: 'IRN', grupo: 'G', createdAt: now, updatedAt: now },

      // Grupo H
      { nombre: 'Arabia Saudita', codigo_fifa: 'KSA', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Qatar', codigo_fifa: 'QAT', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Emiratos Árabes Unidos', codigo_fifa: 'UAE', grupo: 'H', createdAt: now, updatedAt: now },
      { nombre: 'Irak', codigo_fifa: 'IRQ', grupo: 'H', createdAt: now, updatedAt: now },

      // Grupo I
      { nombre: 'Senegal', codigo_fifa: 'SEN', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Marruecos', codigo_fifa: 'MAR', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Nigeria', codigo_fifa: 'NGA', grupo: 'I', createdAt: now, updatedAt: now },
      { nombre: 'Ghana', codigo_fifa: 'GHA', grupo: 'I', createdAt: now, updatedAt: now },

      // Grupo J
      { nombre: 'Camerún', codigo_fifa: 'CMR', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Costa de Marfil', codigo_fifa: 'CIV', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Túnez', codigo_fifa: 'TUN', grupo: 'J', createdAt: now, updatedAt: now },
      { nombre: 'Egipto', codigo_fifa: 'EGY', grupo: 'J', createdAt: now, updatedAt: now },

      // Grupo K
      { nombre: 'Nueva Zelanda', codigo_fifa: 'NZL', grupo: 'K', createdAt: now, updatedAt: now },
      { nombre: 'Panamá', codigo_fifa: 'PAN', grupo: 'K', createdAt: now, updatedAt: now },
      { nombre: 'Jamaica', codigo_fifa: 'JAM', grupo: 'K', createdAt: now, updatedAt: now },
      { nombre: 'Honduras', codigo_fifa: 'HON', grupo: 'K', createdAt: now, updatedAt: now },

      // Grupo L
      { nombre: 'Grecia', codigo_fifa: 'GRE', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'República Checa', codigo_fifa: 'CZE', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'Austria', codigo_fifa: 'AUT', grupo: 'L', createdAt: now, updatedAt: now },
      { nombre: 'Escocia', codigo_fifa: 'SCO', grupo: 'L', createdAt: now, updatedAt: now }

    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Equipos', null, {});
  }
};