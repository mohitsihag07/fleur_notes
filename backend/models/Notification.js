'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  Notification.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      comment: 'Null means broadcast / admin-wide notification',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      defaultValue: 'push',
    },
    reference_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      comment: 'e.g. order_id or product_id for deep linking',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'notifications',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'is_read'] },
    ],
  });

  return Notification;
};
