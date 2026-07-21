'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cart_id', as: 'cart' });
      CartItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      CartItem.belongsTo(models.ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
    }
  }

  CartItem.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'carts', key: 'id' },
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
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Snapshot of price at time of adding to cart',
    },
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cart_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['cart_id'] },
    ],
  });

  return CartItem;
};
