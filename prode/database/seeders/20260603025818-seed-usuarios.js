'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const adminPassword = await bcrypt.hash('Hola1234', 10);

    const seedUsers = [
      { username: 'admin', email: 'admin@prode.com', password_hash: adminPassword, rol: 'admin' },
    ];

    for (const user of seedUsers) {
      const [existing] = await queryInterface.sequelize.query(
        'SELECT id FROM Usuarios WHERE email = ?',
        { replacements: [user.email], type: Sequelize.QueryTypes.SELECT }
      );

      if (existing) {
        await queryInterface.bulkUpdate(
          'Usuarios',
          { password_hash: user.password_hash, rol: user.rol, updatedAt: now },
          { email: user.email }
        );
      } else {
        await queryInterface.bulkInsert('Usuarios', [
          { ...user, createdAt: now, updatedAt: now }
        ], {});
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Usuarios', { email: 'admin@prode.com' }, {});
  }
};
