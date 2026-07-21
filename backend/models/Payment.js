'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      Payment.hasMany(models.PaymentTransaction, { foreignKey: 'payment_id', as: 'transactions' });
    }
  }

  Payment.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'orders', key: 'id' },
    },
    gateway: {
      type: DataTypes.ENUM('razorpay', 'stripe', 'paypal', 'cod'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'INR',
    },
    transaction_id: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Gateway-issued transaction/payment ID',
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['transaction_id'] },
    ],
  });

  return Payment;
};
