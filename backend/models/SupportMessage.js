'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SupportMessage extends Model {
    static associate(models) {
      if (models.SupportConversation) {
        SupportMessage.belongsTo(models.SupportConversation, { foreignKey: 'conversation_id', as: 'conversation' });
      }
    }
  }

  SupportMessage.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    conversation_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    sender_type: {
      type: DataTypes.ENUM('user', 'admin', 'system'),
      defaultValue: 'user',
    },
    sender_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    sender_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'SupportMessage',
    tableName: 'support_messages',
    timestamps: true,
    underscored: true,
  });

  return SupportMessage;
};
