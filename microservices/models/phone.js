'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Phone extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Phone.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      })
      Phone.hasMany(models.Lead, {
        foreignKey: 'phone',
        sourceKey: 'number',
        as: 'leads'
      })
    }
  };
  Phone.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    number: {type: DataTypes.STRING, allowNull: false, unique: true},
    customer_id: {type: DataTypes.BIGINT, allowNull: false}
  }, {
    sequelize,
    modelName: 'Phone',
    tableName: 'phones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Phone;
};
