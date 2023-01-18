'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LeadComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LeadComment.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
    lead_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    text: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'LeadComment',
    tableName: 'lead_comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return LeadComment;
};
