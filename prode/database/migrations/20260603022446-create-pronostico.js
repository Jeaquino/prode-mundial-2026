'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pronosticos', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
      },

      usuario_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      partido_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'Partidos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      goles_local_predicho: Sequelize.INTEGER,
      goles_visitante_predicho: Sequelize.INTEGER,

      puntos_obtenidos: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addConstraint('Pronosticos', {
      fields: ['usuario_id', 'partido_id'],
      type: 'unique',
      name: 'unique_usuario_partido'
    });

    // Índices
    await queryInterface.addIndex('Pronosticos', ['usuario_id']);
    await queryInterface.addIndex('Pronosticos', ['partido_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Pronosticos');
  }
};