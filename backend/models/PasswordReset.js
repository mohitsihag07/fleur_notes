'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PasswordReset extends Model {
    static associate(models) {
      PasswordReset.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }

  PasswordReset.init({
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
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: true,
    underscored: true,
  });

  return PasswordReset;
};
