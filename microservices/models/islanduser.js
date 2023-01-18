'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IslandUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  const models = require ('../models')
  const User = models.User
  const Island = models.Island
  IslandUser.init({
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: {
        model: User,
        key: 'id'
      }
    },
    island_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      references: {
        model: Island,
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'IslandUser',
    tableName: 'island_user',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return IslandUser;
};
