'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProductTagMap extends Model {
    static associate(models) {
      ProductTagMap.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
      ProductTagMap.belongsTo(models.ProductTag, { foreignKey: 'tag_id', as: 'tag' });
    }
  }

  ProductTagMap.init({
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
    tag_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: { model: 'product_tags', key: 'id' },
    },
  }, {
    sequelize,
    modelName: 'ProductTagMap',
    tableName: 'product_tag_map',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['product_id'] },
      { fields: ['tag_id'] },
      { unique: true, fields: ['product_id', 'tag_id'] },
    ],
  });

  return ProductTagMap;
};
