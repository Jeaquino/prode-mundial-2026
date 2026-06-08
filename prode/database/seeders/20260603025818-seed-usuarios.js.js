'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {

    const now = new Date();

    // Generar hash de password
    const adminPassword = await bcrypt.hash('Admin1234!', 10);

    await queryInterface.bulkInsert('Usuarios', [
      {
        username: 'admin',
        email: 'admin@prode.com',
        password_hash: adminPassword,
        rol: 'admin',
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', {
      username: 'admin'
    }, {});
  }
};