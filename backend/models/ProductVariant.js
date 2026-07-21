'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  ProductVariant.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    variant_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g. Small, Large, Red, Custom',
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  }, {
    sequelize,
    modelName: 'ProductVariant',
    tableName: 'product_variants',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['sku'] },
    ],
  });

  return ProductVariant;
};
