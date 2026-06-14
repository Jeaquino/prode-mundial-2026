'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Partido extends Model {
    static associate(models) {
      Partido.belongsTo(models.Equipo, {
        foreignKey: 'equipo_local_id',
        as: 'local'
      });

      Partido.belongsTo(models.Equipo, {
        foreignKey: 'equipo_visitante_id',
        as: 'visitante'
      });

      Partido.belongsTo(models.Estadio, {
        foreignKey: 'estadio_id',
        as: 'estadio'
      });

      Partido.hasMany(models.Pronostico, {
        foreignKey: 'partido_id',
        as: 'pronosticos'
      });
    }
  }

  Partido.init({
    equipo_local_id: DataTypes.BIGINT,
    equipo_visitante_id: DataTypes.BIGINT,
    estadio_id: DataTypes.BIGINT,
    fecha_hora: DataTypes.DATE,
    fase: DataTypes.STRING,
    goles_local: DataTypes.INTEGER,
    goles_visitante: DataTypes.INTEGER,
    estado: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Partido',
    tableName: 'Partidos',
    timestamps: true
  });

  return Partido;
};