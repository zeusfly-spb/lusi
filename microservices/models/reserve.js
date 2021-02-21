'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reserve extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reserve.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      })
      Reserve.belongsTo(models.Size, {
        foreignKey: 'size_id',
        as: 'size'
      })
      Reserve.belongsTo(models.Type, {
        foreignKey: 'type_id',
        as: 'type'
      })
    }
  };
  Reserve.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    product_id: {type: DataTypes.BIGINT, allowNull: false},
    type_id: DataTypes.BIGINT,
    size_id: DataTypes.BIGINT,
    count: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
  }, {
    sequelize,
    modelName: 'Reserve',
    tableName: 'reserves',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Reserve;
};
