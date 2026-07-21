'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductTag extends Model {
    static associate(models) {
      ProductTag.belongsToMany(models.Product, {
        through: models.ProductTagMap,
        foreignKey: 'tag_id',
        otherKey: 'product_id',
        as: 'products',
      });
    }
  }

  ProductTag.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'ProductTag',
    tableName: 'product_tags',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['slug'] },
    ],
  });

  return ProductTag;
};
