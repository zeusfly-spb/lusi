'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkDay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      WorkDay.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
      WorkDay.hasMany(models.TimeBreak, {
        foreignKey: 'work_day_id',
        as: 'time_breaks'
      })
    }
  }
  WorkDay.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    island_id: DataTypes.BIGINT.UNSIGNED,
    date: DataTypes.DATEONLY,
    time_start: {
      type: DataTypes.TIME,
      allowNull: false
    },
    time_finish: DataTypes.TIME,
    working_hours: DataTypes.DECIMAL(8, 2)
  }, {
    sequelize,
    modelName: 'WorkDay',
    tableName: 'work_days',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return WorkDay;
};
