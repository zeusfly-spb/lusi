'use strict';
const moment = require('moment')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Appointment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
      Appointment.belongsTo(models.User, {
        foreignKey: 'performer_id',
        as: 'performer'
      })
      Appointment.belongsTo(models.Lead, {
        foreignKey: 'lead_id',
        as: 'lead'
      })
      Appointment.belongsTo(models.Service, {
        foreignKey: 'service_id',
        as: 'service'
      })
      Appointment.belongsTo(models.Island, {
        foreignKey: 'island_id',
        as: 'island'
      })
    }
  }
  Appointment.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {type: DataTypes.BIGINT, allowNull: false},
    performer_id: DataTypes.BIGINT,
    service_id: DataTypes.BIGINT,
    lead_id: DataTypes.BIGINT,
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    client_phone: DataTypes.STRING,
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    client_name: {type: DataTypes.STRING, allowNull: false},
    cabinet_id: DataTypes.BIGINT,
    comments: DataTypes.JSON,
    status_id: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1},
    subscribe_id: DataTypes.BIGINT,
    deal_id: DataTypes.BIGINT,
    status: {
      type: DataTypes.VIRTUAL,
      get () {
        const statusList = {
          0: 'cancelled',
          1: 'active',
          2: 'postponed',
          3: 'moderate',
          4: 'completed'
        }
        return statusList[this.status_id]
      },
      set (val) {
        throw new Error('Do not try to set the `status` value!')
      }
    },
    last_comment: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.comments && this.comments.length && this.comments[this.comments.length - 1]['text'] || null
      },
      set (val) {
        throw new Error('Do not try to set the `last_comment` value!')
      }
    }
    }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Appointment;
};
