'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Island extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Island.belongsToMany(models.User, {
        through: models.IslandUser,
        foreignKey: 'island_id',
        as: 'users'
      })
      Island.hasMany(models.WorkDay, {
        foreignKey: 'island_id',
        as: 'workdays'
      })
      Island.hasMany(models.Appointment, {
        foreignKey: 'island_id',
        as: 'events'
      })
    }
  }
  Island.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.STRING,
    vpbx_extension: DataTypes.STRING(4),
    options: DataTypes.JSON,
    chiefs: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Island',
    tableName: 'islands',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  Island.prototype.sendReminders = function () {
    console.log(this.options)
  }
  return Island;
};
