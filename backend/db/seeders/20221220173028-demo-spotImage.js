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
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 2,
        url: 'https://d3lp4xedbqa8a5.cloudfront.net/s3/digital-cougar-assets/homes/2020/01/31/21050/1550465012786_Jerome-St051x.jpg?width=768&height=639&mode=crop&quality=75',
        preview: true
      },
      {
        spotId: 3,
        url: 'https://www.military.com/base-guide/area-51',
        preview: false
      },
      {
        spotId: 4,
        url: 'https://media.distractify.com/brand-img/FpbVtSneg/0x0/faze-1586270114894.png',
        preview: true
      },
      {
        spotId: 1,
        url: 'https://cdn.mos.cms.futurecdn.net/6Hm49gsGUDmkuhxYfMGNFZ.jpg',
        preview: true
      },
      {
        spotId: 5,
        url: 'https://prod.assets.earlygamecdn.com/images/Rust-in-Modern-Warfare-2.jpg',
        preview: true
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
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
