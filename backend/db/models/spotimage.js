'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpotImage extends Model {
    toSafeObject() {
      const { id, url, preview } = this;
      return { id, url, preview }
    }
    static associate(models) {
      SpotImage.belongsTo(models.Spot, { foreignKey: 'spotId' });
    }
  }
  SpotImage.init({
    spotId: {
      type: DataTypes.INTEGER,
      references: { model: 'Spot' }
    },
    url: DataTypes.STRING,
    preview: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SpotImage',
    scopes: {
      clean: {
        attributes: {
          exclude: ['spotId', 'createdAt', 'updatedAt']
        }
      }
    }
  });
  return SpotImage;
};
