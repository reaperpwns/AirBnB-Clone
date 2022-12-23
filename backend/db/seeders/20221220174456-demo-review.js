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
    options.tableName = 'Reviews';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 4,
        userId: 1,
        review: 'mlg and lit tbh',
        stars: 4
      },
      {
        spotId: 1,
        userId: 2,
        review: 'hated it. wasnt in space',
        stars: 1
      },
      {
        spotId: 2,
        userId: 3,
        review: 'bought stuff and things',
        stars: 3
      },
      {
        spotId: 5,
        userId: 1,
        review: 'for all pro gamers named kyle',
        stars: 5
      },
      {
        spotId: 3,
        userId: 2,
        review: 'saw dem aliens',
        stars: 2
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
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      userId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
