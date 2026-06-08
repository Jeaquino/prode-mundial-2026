'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pronostico extends Model {
    static associate(models) {
      Pronostico.belongsTo(models.Usuario, {
        foreignKey: 'usuario_id',
        as: 'usuario'
      });

      Pronostico.belongsTo(models.Partido, {
        foreignKey: 'partido_id',
        as: 'partido'
      });
    }
  }

  Pronostico.init({
    usuario_id: DataTypes.BIGINT,
    partido_id: DataTypes.BIGINT,
    goles_local_predicho: DataTypes.INTEGER,
    goles_visitante_predicho: DataTypes.INTEGER,
    puntos_obtenidos: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Pronostico',
    tableName: 'Pronosticos',
    timestamps: true
  });

  return Pronostico;
};
