'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PuntuacionRegla extends Model {
    static associate(models) {
      // generalmente no requiere FK directa
    }
  }

  PuntuacionRegla.init({
    descripcion: DataTypes.STRING,
    puntos: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PuntuacionRegla',
    tableName: 'PuntuacionReglas',
    timestamps: true
  });

  return PuntuacionRegla;
};