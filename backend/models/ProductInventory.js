'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductInventory extends Model {
    static associate(models) {
      ProductInventory.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  ProductInventory.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'products', key: 'id' },
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    reserved_quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: 'Qty locked in pending orders',
    },
    low_stock_limit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 5,
      comment: 'Alert threshold for low stock',
    },
  }, {
    sequelize,
    modelName: 'ProductInventory',
    tableName: 'product_inventory',
    timestamps: true,
    underscored: true,
  });

  return ProductInventory;
};
