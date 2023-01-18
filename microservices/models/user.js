'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Group, {
        foreignKey: 'group_id',
        as: 'group'
      })
      User.hasOne(models.DocumentPack, {
        foreignKey: 'user_id',
        as: 'document_pack'
      })
      User.hasMany(models.WorkDay, {
        foreignKey: 'user_id',
        as: 'workdays'
      })
      User.hasMany(models.Prize, {
        foreignKey: 'user_id',
        as: 'prizes'
      })
      User.hasMany(models.Forfeit, {
        foreignKey: 'user_id',
        as: 'forfeits'
      })
      User.hasMany(models.Sick, {
        foreignKey: 'user_id',
        as: 'sicks'
      })
      User.hasMany(models.Prepay, {
        foreignKey: 'user_id',
        as: 'prepays'
      })
      User.hasMany(models.Vacation, {
        foreignKey: 'user_id',
        as: 'vacations'
      })
      User.belongsToMany(models.Island, {
        through: models.IslandUser,
        foreignKey: 'user_id',
        as: 'islands'
      })
      User.hasMany(models.Island, {
        foreignKey: 'chief_id',
        as: 'controlled_islands'
      })
    }
  }
  User.init({
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    remember_token: { type: DataTypes.STRING},
    is_superadmin: { type: DataTypes.BOOLEAN, defaultValue: false},
    first_name: { type: DataTypes.STRING },
    last_name: { type: DataTypes.STRING },
    patronymic: { type: DataTypes.STRING },
    birth_date: { type: DataTypes.DATEONLY },
    phone: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    group_id: {
      type: DataTypes.BIGINT.UNSIGNED
    },
    island_id: {
      type: DataTypes.BIGINT.UNSIGNED,
    },
    avatar: { type: DataTypes.STRING },
    fired_at: { type: DataTypes.DATEONLY, defaultValue: null},
    vpbx_extension: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    rates: { type: DataTypes.JSON },
    full_name: {
      type: DataTypes.VIRTUAL,
      get () {
        return `${this.last_name || ''} ${this.first_name} ${this.patronymic || ''}`
      },
      set (val) {
        throw new Error('Do not try to set the `full_name` value!');
      }
    },
    is_admin: {
      type: DataTypes.VIRTUAL,
      get () {
        return !!this.group && this.group.purpose && this.group.purpose === 'admin' || false
      },
      set (val) {
        throw new Error('Do not try to set the `is_admin` value!');
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return User;
};
