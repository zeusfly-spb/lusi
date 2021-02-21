'use strict';
const moment = require('moment')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Expense.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
      Expense.belongsTo(models.Island, {
        foreignKey: 'island_id',
        as: 'island'
      })
    }
  }
  Expense.init({
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
    island_id:  {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: moment().format('YYYY-MM-DD HH:mm:ss'),
      allowNull: false
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: moment().format('YYYY-MM-DD HH:mm:ss'),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Expense',
    tableName: 'expenses',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Expense;
};
