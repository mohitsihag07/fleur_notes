'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {}
  }

  Setting.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'e.g. site_name, logo, contact_email, gst_rate, shipping_charge',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json', 'image'),
      defaultValue: 'string',
    },
    group: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'e.g. general, payment, shipping, social',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'settings',
    timestamps: true,
    underscored: true,
  });

  return Setting;
};
