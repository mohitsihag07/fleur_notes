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
    tagline: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    primary_cta_text: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    primary_cta_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    secondary_cta_text: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    secondary_cta_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    display_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    type: {
      type: DataTypes.ENUM('home', 'shop', 'categories', 'about', 'contact'),
      defaultValue: 'home',
      allowNull: false,
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
