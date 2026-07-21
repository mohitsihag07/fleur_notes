'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentTransaction extends Model {
    static associate(models) {
      PaymentTransaction.belongsTo(models.Payment, { foreignKey: 'payment_id', as: 'payment' });
    }
  }

  PaymentTransaction.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    payment_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'payments', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('charge', 'refund', 'webhook'),
      defaultValue: 'charge',
    },
    request: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Full gateway request payload',
    },
    response: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Full gateway response payload',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    gateway_event_id: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'PaymentTransaction',
    tableName: 'payment_transactions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['payment_id'] },
    ],
  });

  return PaymentTransaction;
};
