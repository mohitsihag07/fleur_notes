'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Review.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      Review.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    }
  }

  Review.init({
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
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    order_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'orders', key: 'id' },
    },
    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of image URLs uploaded by reviewer',
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    admin_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['user_id'] },
    ],
  });

  return Review;
};
