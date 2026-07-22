'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      Product.hasMany(models.ProductImage, { foreignKey: 'product_id', as: 'images' });
      Product.hasOne(models.ProductInventory, { foreignKey: 'product_id', as: 'inventory' });
      Product.hasMany(models.ProductVariant, { foreignKey: 'product_id', as: 'variants' });
      Product.belongsToMany(models.ProductTag, {
        through: models.ProductTagMap,
        foreignKey: 'product_id',
        otherKey: 'tag_id',
        as: 'tags',
      });
      Product.hasMany(models.WishlistItem, { foreignKey: 'product_id', as: 'wishlistItems' });
      Product.hasMany(models.CartItem, { foreignKey: 'product_id', as: 'cartItems' });
      Product.hasMany(models.OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
      Product.hasMany(models.Review, { foreignKey: 'product_id', as: 'reviews' });
    }
  }

  Product.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'categories', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(250),
      allowNull: false,
      unique: true,
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    short_description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    sale_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Discounted price; if null, full price applies',
    },
    weight: {
      type: DataTypes.DECIMAL(8, 3),
      allowNull: true,
      comment: 'Weight in kg',
    },
    length: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    width: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    height: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_best_seller: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_new_arrival: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['slug'] },
      { fields: ['sku'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
    ],
  });

  return Product;
};
