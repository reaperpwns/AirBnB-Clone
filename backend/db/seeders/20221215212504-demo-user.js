'use strict';
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    return queryInterface.bulkInsert(options, [
      {
        email: 'kyleenergy@user.io',
        username: 'monsterman',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'kyle',
        lastName: 'monster'
      },
      {
        email: 'samhyde@user.io',
        username: 'chickenman',
        hashedPassword: bcrypt.hashSync('password2'),
        firstName: 'sam',
        lastName: 'hyde'
      },
      {
        email: 'mrstruggle@user.io',
        username: 'yeet',
        hashedPassword: bcrypt.hashSync('password3'),
        firstName: 'yeet',
        lastName: 'yaw'
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['monsterman', 'chickenman', 'yeet'] }
    }, {});
  }
};
