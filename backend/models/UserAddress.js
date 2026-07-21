'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {
    static associate(models) {
      UserAddress.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      UserAddress.hasMany(models.Order, { foreignKey: 'address_id', as: 'orders' });
    }
  }

  UserAddress.init({
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
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    pincode: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'India',
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    label: {
      type: DataTypes.ENUM('home', 'work', 'other'),
      defaultValue: 'home',
    },
  }, {
    sequelize,
    modelName: 'UserAddress',
    tableName: 'user_addresses',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
    ],
  });

  return UserAddress;
};
