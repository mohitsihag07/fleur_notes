'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
    }
  }

  OrderItem.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'orders', key: 'id' },
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    variant_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'product_variants', key: 'id' },
    },
    product_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Snapshot at time of order',
    },
    product_sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Unit price snapshot',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'price * quantity',
    },
  }, {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['order_id'] },
    ],
  });

  return OrderItem;
};
