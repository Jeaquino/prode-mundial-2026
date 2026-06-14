'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FixtureSync extends Model {}

  FixtureSync.init({
    source: DataTypes.STRING,
    external_id: DataTypes.STRING,
    payload: DataTypes.JSON,
    synced_at: DataTypes.DATE,
    action: DataTypes.STRING,
    note: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'FixtureSync',
    tableName: 'FixtureSyncs',
    timestamps: true,
  });

  return FixtureSync;
};
