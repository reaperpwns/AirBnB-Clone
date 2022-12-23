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
    options.tableName = 'ReviewImages';
    return queryInterface.bulkInsert(options, [
      {
        reviewId: 1,
        url: 'https://photos.zillowstatic.com/fp/99df4795b6b33ec8c56a458d0da2a2f0-cc_ft_960.jpg'
      },
      {
        reviewId: 2,
        url: 'https://www.ocregister.com/wp-content/uploads/2021/07/OCR-L-APRIL2021-POM-54.jpg?w=506'
      },
      {
        reviewId: 3,
        url: 'https://sites.psu.edu/ksl5279/files/2018/09/holger-link-759529-unsplash-128flde-e1538349778457.jpg'
      },
      {
        reviewId: 4,
        url: 'https://fenixbazaar.com/wp-content/uploads/2019/09/rust.jpg.webp'
      },
      {
        reviewId: 5,
        url: 'https://cdn.mos.cms.futurecdn.net/7ya4qrHsoArDh8nFxzB87U.jpg'
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
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
