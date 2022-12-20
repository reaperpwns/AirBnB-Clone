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
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 2,
        address: '123 disney lane',
        city: 'yeehaw',
        state: 'texas',
        country: 'russia',
        lat: 420.696969,
        lng: -69.420,
        name: 'space mountain',
        description: 'lots of space and mountains',
        price: 5.00
      },
      {
        ownerId: 3,
        address: 'P. sherman 42 wallaby way',
        city: 'Sidney',
        state: 'australia',
        country: 'asia',
        lat: 100.4392,
        lng: 22.354,
        name: 'gift shop',
        description: 'literally just a gift shop',
        price: 100.52
      },
      {
        ownerId: 2,
        address: 'area 51',
        city: 'sin city',
        state: 'alaska',
        country: 'canada',
        lat: -7.4442,
        lng: 789.33345,
        name: 'area 51',
        description: 'where the aliens are',
        price: 74.74
      },
      {
        ownerId: 1,
        address: '78 colorda way',
        city: 'colorado springs',
        state: 'tennessee',
        country: 'africa',
        lat: -34.66775,
        lng: 734.454789,
        name: 'faze house',
        description: 'the pro gamer spot',
        price: 33748.98
      },
      {
        ownerId: 1,
        address: '360 no scope ave',
        city: 'rust',
        state: 'depression',
        country: 'murica',
        lat: 37845.76854,
        lng: -3.4549,
        name: 'get rekt villa',
        description: 'l33t',
        price: 1.69
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
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      ownerId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
