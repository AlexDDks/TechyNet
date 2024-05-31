'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Products', [
      {
        name: 'Wireless Headphones',
        price: 199.99,
        discount: 20,
        category: 'Electronics',
        stock: 50,
        description: 'High-quality wireless headphones with noise-cancellation and long battery life.',
        imageUrl: 'wireless-headphones.jpg',
        monthsInterestFree: 12,
        store: 'Main Store',
        rating: 4.5,
        reviewCount: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Smartwatch',
        price: 299.99,
        discount: 15,
        category: 'Electronics',
        stock: 30,
        description: 'Advanced smartwatch with fitness tracking, GPS, and customizable watch faces.',
        imageUrl: 'smartwatch.jpg',
        monthsInterestFree: 6,
        store: 'Tech Store',
        rating: 4.7,
        reviewCount: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gaming Laptop',
        price: 1499.99,
        discount: 10,
        category: 'Computers',
        stock: 20,
        description: 'High-performance gaming laptop with the latest graphics card and fast processor.',
        imageUrl: 'gaming-laptop.jpg',
        monthsInterestFree: 18,
        store: 'Computer Store',
        rating: 4.8,
        reviewCount: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bluetooth Speaker',
        price: 89.99,
        discount: 5,
        category: 'Electronics',
        stock: 100,
        description: 'Portable Bluetooth speaker with excellent sound quality and long battery life.',
        imageUrl: 'bluetooth-speaker.jpg',
        monthsInterestFree: 3,
        store: 'Audio Store',
        rating: 4.3,
        reviewCount: 300,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Smartphone',
        price: 799.99,
        discount: 25,
        category: 'Electronics',
        stock: 40,
        description: 'Latest model smartphone with high-resolution display and powerful camera.',
        imageUrl: 'smartphone.jpg',
        monthsInterestFree: 24,
        store: 'Mobile Store',
        rating: 4.6,
        reviewCount: 500,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {});
  }
};
