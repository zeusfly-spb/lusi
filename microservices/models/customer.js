'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Customer.hasMany(models.Phone, {
        foreignKey: 'customer_id',
        as: 'phones'
      })
      Customer.hasMany(models.Deal, {
        foreignKey: 'customer_id',
        as: 'deals'
      })
    }
  };
  Customer.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: DataTypes.STRING,
    patronymic: DataTypes.STRING,
    address: DataTypes.STRING,
    birth_date: DataTypes.DATEONLY,
    email: DataTypes.STRING,
    full_name: {
      type: DataTypes.VIRTUAL,
      get () {
        return `${this.last_name || ''} ${this.first_name} ${this.patronymic || ''}`
      },
      set (val) {
        throw new Error('Do not try to set the `full_name` value!');
      }
    }
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Customer;
};
