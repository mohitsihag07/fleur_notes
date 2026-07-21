'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Order.belongsTo(models.UserAddress, { foreignKey: 'address_id', as: 'address' });
      Order.belongsTo(models.Coupon, { foreignKey: 'coupon_id', as: 'coupon' });
      Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
      Order.hasMany(models.OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
      Order.hasOne(models.Shipment, { foreignKey: 'order_id', as: 'shipment' });
      Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'payment' });
      Order.hasMany(models.CouponUsage, { foreignKey: 'order_id', as: 'couponUsages' });
      Order.hasOne(models.Review, { foreignKey: 'order_id', as: 'review' });
    }
  }

  Order.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: 'e.g. ORD-20240101-00001',
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    address_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'user_addresses', key: 'id' },
    },
    coupon_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'coupons', key: 'id' },
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    shipping_charge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    grand_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'pending', 'confirmed', 'packed', 'shipped',
        'out_for_delivery', 'delivered', 'cancelled',
        'return_requested', 'returned', 'refunded'
      ),
      defaultValue: 'pending',
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.ENUM('razorpay', 'stripe', 'paypal', 'cod'),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Customer order notes',
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['order_number'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  });

  return Order;
};
