'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    action: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'e.g. created_product, deleted_category, updated_order_status',
    },
    module: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'e.g. products, orders, customers',
    },
    record_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: 'ID of the affected record',
    },
    old_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    new_values: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['module', 'record_id'] },
    ],
  });

  return AuditLog;
};
