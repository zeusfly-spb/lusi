'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentPack extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DocumentPack.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'document_pack'
      })
      DocumentPack.hasMany(models.CustomDoc, {
        foreignKey: 'document_pack_id',
        as: 'custom_docs'
      })
    }
  };
  DocumentPack.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false},
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false},
  }, {
    sequelize,
    modelName: 'DocumentPack',
    tableName: 'document_packs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return DocumentPack;
};