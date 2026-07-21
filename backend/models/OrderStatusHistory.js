'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderStatusHistory extends Model {
    static associate(models) {
      OrderStatusHistory.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
      OrderStatusHistory.belongsTo(models.User, { foreignKey: 'changed_by', as: 'changedByUser' });
    }
  }

  OrderStatusHistory.init({
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
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    changed_by: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      comment: 'Admin/customer who triggered the change',
    },
  }, {
    sequelize,
    modelName: 'OrderStatusHistory',
    tableName: 'order_status_history',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['order_id'] },
    ],
  });

  return OrderStatusHistory;
};
