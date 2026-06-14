'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estadio extends Model {
    static associate(models) {
      Estadio.hasMany(models.Partido, {
        foreignKey: 'estadio_id',
        as: 'partidos'
      });
    }
  }

  Estadio.init({
    nombre: {
      type: DataTypes.STRING,
      unique: true
    },
    ciudad: DataTypes.STRING,
    pais: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Estadio',
    tableName: 'Estadios',
    timestamps: true
  });

  return Estadio;
};