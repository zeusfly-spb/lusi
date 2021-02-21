'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomDoc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CustomDoc.init({
    id: {type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, allowNull: false, autoIncrement: true},
    document_pack_id: {type: DataTypes.BIGINT.UNSIGNED, allowNull: false},
    name: DataTypes.STRING,
    location: { type: DataTypes.STRING, defaultValue: null },
    parent_id:{ type: DataTypes.BIGINT, defaultValue: null}
  }, {
    sequelize,
    modelName: 'CustomDoc',
    tableName: 'custom_docs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return CustomDoc;
};