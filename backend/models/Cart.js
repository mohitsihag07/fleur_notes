'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Cart.hasMany(models.CartItem, { foreignKey: 'cart_id', as: 'items' });
    }
  }

  Cart.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'carts',
    timestamps: true,
    underscored: true,
  });

  return Cart;
};
