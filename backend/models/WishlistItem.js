'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WishlistItem extends Model {
    static associate(models) {
      WishlistItem.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      WishlistItem.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  WishlistItem.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'WishlistItem',
    tableName: 'wishlist_items',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'product_id'] },
    ],
  });

  return WishlistItem;
};
