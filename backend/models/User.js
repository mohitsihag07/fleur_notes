'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.UserProfile, { foreignKey: 'user_id', as: 'profile' });
      User.hasMany(models.UserAddress, { foreignKey: 'user_id', as: 'addresses' });
      User.hasMany(models.CustomerActivity, { foreignKey: 'user_id', as: 'activities' });
      User.hasMany(models.WishlistItem, { foreignKey: 'user_id', as: 'wishlistItems' });
      User.hasOne(models.Cart, { foreignKey: 'user_id', as: 'cart' });
      User.hasMany(models.Order, { foreignKey: 'user_id', as: 'orders' });
      User.hasMany(models.Review, { foreignKey: 'user_id', as: 'reviews' });
      User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
      User.hasMany(models.PasswordReset, { foreignKey: 'user_id', as: 'passwordResets' });
      User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
    }
  }

  User.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('user','admin'),
      allowNull: false,
      defaultValue : "user"
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active','inactive','blocked', 'suspended'),
      defaultValue: 'active',
    },
    otp : {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    otp_expires_at : {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,   // enables soft deletes via deleted_at
    indexes: [
      { fields: ['email'] },
    ],
  });

  return User;
};
