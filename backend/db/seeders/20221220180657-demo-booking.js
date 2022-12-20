'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 2,
        startDate: '2022-07-17',
        endDate: '2022-07-18'
      },
      {
        spotId: 2,
        userId: 3,
        startDate: '2022-12-25',
        endDate: '2023-03-05'
      },
      {
        spotId: 3,
        userId: 2,
        startDate: '2022-05-09',
        endDate: '2022-05-17'
      },
      {
        spotId: 4,
        userId: 1,
        startDate: '2022-01-01',
        endDate: '2023-01-01'
      },
      {
        spotId: 5,
        userId: 1,
        startDate: '2022-04-20',
        endDate: '2022-05-01'
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
    *
    * Example:
    * await queryInterface.bulkDelete('People', null, {});
    */
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
