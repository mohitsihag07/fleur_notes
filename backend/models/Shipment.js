'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shipment extends Model {
    static associate(models) {
      Shipment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    }
  }

  Shipment.init({
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
    tracking_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shipping_company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'e.g. Delhivery, Shiprocket, BlueDart',
    },
    tracking_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    expected_delivery: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    shipped_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Shipment',
    tableName: 'shipments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tracking_number'] },
    ],
  });

  return Shipment;
};
