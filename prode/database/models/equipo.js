'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Equipo extends Model {
    static associate(models) {
      Equipo.hasMany(models.Partido, {
        foreignKey: 'equipo_local_id',
        as: 'partidos_local'
      });

      Equipo.hasMany(models.Partido, {
        foreignKey: 'equipo_visitante_id',
        as: 'partidos_visitante'
      });
    }
  }

  Equipo.init({
    nombre: {
      type: DataTypes.STRING,
      unique: true
    },
    codigo_fifa: {
      type: DataTypes.STRING,
      unique: true
    },
    grupo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Equipo',
    tableName: 'Equipos',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    underscored: true
  });

  return Equipo;
};