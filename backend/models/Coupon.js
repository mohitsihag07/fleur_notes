'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    static associate(models) {
      Coupon.hasMany(models.CouponUsage, { foreignKey: 'coupon_id', as: 'usages' });
      Coupon.hasMany(models.Order, { foreignKey: 'coupon_id', as: 'orders' });
    }
  }

  Coupon.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('percentage', 'fixed'),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Percentage (0-100) or fixed rupee amount',
    },
    minimum_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Minimum cart value to apply coupon',
    },
    maximum_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cap on discount for percentage coupons',
    },
    usage_limit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: 'Total uses allowed; null = unlimited',
    },
    usage_count: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    per_user_limit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 1,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired'),
      defaultValue: 'active',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Coupon',
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['code'] },
    ],
  });

  return Coupon;
};
