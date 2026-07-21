'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Banner extends Model {
    static associate(models) {}
  }

  Banner.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    subtitle: {
      type: DataTypes.STRING(300),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    button_text: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    button_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    display_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Banner',
    tableName: 'banners',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  return Banner;
};
