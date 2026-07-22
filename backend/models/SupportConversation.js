'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SupportConversation extends Model {
    static associate(models) {
      if (models.User) {
        SupportConversation.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      }
      if (models.SupportMessage) {
        SupportConversation.hasMany(models.SupportMessage, { foreignKey: 'conversation_id', as: 'messages' });
      }
    }
  }

  SupportConversation.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    user_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    user_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'closed'),
      defaultValue: 'active',
    },
    unread_admin: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    unread_user: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_message_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'SupportConversation',
    tableName: 'support_conversations',
    timestamps: true,
    underscored: true,
  });

  return SupportConversation;
};
