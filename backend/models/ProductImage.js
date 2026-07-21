'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
    }
  }

  ProductImage.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'products', key: 'id' },
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    alt_text: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    is_thumbnail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sort_order: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'product_images',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
    ],
  });

  return ProductImage;
};
