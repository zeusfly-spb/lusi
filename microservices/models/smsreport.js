'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SmsReport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  SmsReport.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    number: {type: DataTypes.STRING, allowNull: false},
    text: {type: DataTypes.STRING, allowNull: false},
    user_id: {type: DataTypes.BIGINT, allowNull: false},
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    length: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.text.length || 0
      },
      set () {
        throw new Error('Do not try to set the `length` value!');
      }
    }
  }, {
    sequelize,
    modelName: 'SmsReport',
    tableName: 'sms_reports',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return SmsReport;
};
