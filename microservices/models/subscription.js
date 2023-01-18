'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Subscription.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {type: DataTypes.STRING, allowNull: false},
    service_id: {type: DataTypes.BIGINT, allowNull: false},
    number_days: {type: DataTypes.INTEGER, allowNull: false},
    supply_amount: {type: DataTypes.TINYINT, allowNull: false},
    base_price: {type: DataTypes.INTEGER, allowNull: false},
    changeable_price: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Subscription;
};
