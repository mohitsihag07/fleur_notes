'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomerActivity extends Model {
    static associate(models) {
      CustomerActivity.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  CustomerActivity.init({
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
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'e.g. login, logout, password_changed',
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'CustomerActivity',
    tableName: 'customer_activity',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
    ],
  });

  return CustomerActivity;
};
