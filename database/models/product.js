'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Define associations here
    }
  }
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    discount: DataTypes.FLOAT,
    category: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    imageUrl: DataTypes.STRING,
    monthsInterestFree: DataTypes.INTEGER,
    store: DataTypes.STRING,
    rating: DataTypes.FLOAT,
    reviewCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};
