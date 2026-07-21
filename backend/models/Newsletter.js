'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Newsletter extends Model {
    static associate(models) {}
  }

  Newsletter.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    subscribed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    unsubscribed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Newsletter',
    tableName: 'newsletters',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
    ],
  });

  return Newsletter;
};
