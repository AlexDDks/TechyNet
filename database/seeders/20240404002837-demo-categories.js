'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'Smartphones',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Computing',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Blogging',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gaming',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Accessories',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};

