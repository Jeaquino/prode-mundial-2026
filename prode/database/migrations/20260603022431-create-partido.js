'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Partidos', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      equipo_local_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Equipos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      equipo_visitante_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Equipos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      estadio_id: {
        type: Sequelize.BIGINT,
        references: {
          model: 'Estadios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      fecha_hora: {
        type: Sequelize.DATE,
        allowNull: false
      },

      fase: Sequelize.STRING,

      goles_local: Sequelize.INTEGER,
      goles_visitante: Sequelize.INTEGER,

      estado: {
        type: Sequelize.STRING,
        defaultValue: 'PENDIENTE'
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Índices útiles
    await queryInterface.addIndex('Partidos', ['equipo_local_id']);
    await queryInterface.addIndex('Partidos', ['equipo_visitante_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Partidos');
  }
};
``