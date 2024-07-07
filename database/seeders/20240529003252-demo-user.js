'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '$2b$10$P7JdPiG3He6tH7JfQpDQzOL1v9kqEfM.zfyT1OmVnTyAa8mINzj.i', // bcrypt hashed password for "password123"
        imageUrl: 'default.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        password: '$2b$10$P7JdPiG3He6tH7JfQpDQzOL1v9kqEfM.zfyT1OmVnTyAa8mINzj.i', // bcrypt hashed password for "password123"
        imageUrl: 'default.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
