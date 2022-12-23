'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Spot.hasMany(models.Booking, { foreignKey: 'spotId', onDelete: 'cascade' });
      Spot.hasMany(models.Review, { foreignKey: 'spotId', onDelete: 'cascade' });
      Spot.hasMany(models.SpotImage, { foreignKey: 'spotId', onDelete: 'cascade' });
      Spot.belongsTo(models.User, { foreignKey: 'ownerId', as: 'Owner' });
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      references: { model: 'User' }
    },
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL,
    name: {
      type: DataTypes.STRING,
      validate: {
        max: 50
      }
    },
    description: DataTypes.STRING,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};
