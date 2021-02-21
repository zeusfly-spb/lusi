'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StockAction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      StockAction.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      })
      // StockAction.belongsTo(models.Type, {
      //   foreignKey: 'type_id',
      //   as: 'type'
      // })
      StockAction.belongsTo(models.Size, {
        foreignKey: 'size_id',
        as: 'size'
      })
      StockAction.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  };
  StockAction.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    product_id: {type: DataTypes.BIGINT, allowNull: false},
    user_id: {type: DataTypes.BIGINT, allowNull: false},
    type_id: {type: DataTypes.BIGINT, allowNull: false},
    size_id: {type: DataTypes.BIGINT, allowNull: false},
    deal_id: DataTypes.BIGINT,
    count: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.ENUM('receipt', 'expense'), allowNull: false},
    comment: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'StockAction',
    tableName: 'stock_actions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return StockAction;
};
