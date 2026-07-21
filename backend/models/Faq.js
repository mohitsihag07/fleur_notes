'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Faq extends Model {
    static associate(models) {}
  }

  Faq.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g. Shipping, Returns, Payment',
    },
    sort_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'Faq',
    tableName: 'faqs',
    timestamps: true,
    underscored: true,
  });

  return Faq;
};
