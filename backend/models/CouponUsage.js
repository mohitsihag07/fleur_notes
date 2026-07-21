'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CouponUsage extends Model {
    static associate(models) {
      CouponUsage.belongsTo(models.Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
      CouponUsage.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      CouponUsage.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    }
  }

  CouponUsage.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    coupon_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'coupons', key: 'id' },
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'orders', key: 'id' },
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CouponUsage',
    tableName: 'coupon_usages',
    timestamps: true,
    underscored: true,
  });

  return CouponUsage;
};
