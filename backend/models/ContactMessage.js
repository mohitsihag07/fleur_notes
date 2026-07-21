'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContactMessage extends Model {
    static associate(models) {}
  }

  ContactMessage.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'closed'),
      defaultValue: 'open',
    },
    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ContactMessage',
    tableName: 'contact_messages',
    timestamps: true,
    underscored: true,
  });

  return ContactMessage;
};
