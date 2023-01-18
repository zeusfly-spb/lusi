'use strict';
const moment = require('moment')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscribe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Subscribe.belongsTo(models.Subscription, {
        foreignKey: 'subscription_id',
        as: 'subscription'
      })
      Subscribe.hasMany(models.Appointment, {
        foreignKey: 'subscribe_id',
        as: 'events'
      })
      Subscribe.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      })
      Subscribe.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  };
  Subscribe.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    subscription_id: {type: DataTypes.BIGINT, allowNull: false},
    customer_id: {type: DataTypes.BIGINT, allowNull: false},
    user_id: {type: DataTypes.BIGINT, allowNull: false},
    start_date: {type: DataTypes.DATEONLY, allowNull: false},
    supply_count: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
    comments: DataTypes.JSON,
    finish_date: {
      type: DataTypes.VIRTUAL,
      get () {
        return moment(this.start_date)
            .add(this.subscription && this.subscription.number_days || 0, 'days')
            .format('YYYY-MM-DD')
      },
      set () {
        throw new Error('Do not try to set the `finish_date` value!')
      }
    },
    start_month: {
      type: DataTypes.VIRTUAL,
      get () {
        return moment(this.start_date).format('YYYY-MM')
      },
      set () {
        throw new Error('Do not try to set the `start_month` value!')
      }
    },
    finish_month: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.finish_date && moment(this.finish_date).format('YYYY-MM') || null
      },
      set () {
        throw new Error('Do not try to set the `finish_month` value!')
      }
    },
    nominal: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.subscription && this.subscription.supply_amount || 0
      },
      set () {
        throw new Error('Do not try to set the `nominal` value!')
      }
    },
    scale: {
      type: DataTypes.VIRTUAL,
      get () {
        let scale = []
        let eventsCount = this.events.length || 0
        for (let i = 0; i < this.nominal; i++) {
          let step = null
          if (i <= eventsCount - 1) {
            step = this.events[i].status
          }
          scale.push(step)
        }
        return scale
      },
      set () {
        throw new Error('Do not try to set the `scale` value!')
      }
    },
    last_event: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.events.length && this.events[this.events.length - 1] || null
      },
      set () {
        throw new Error('Do not try to set the `last_event` value!')
      }
    },
    last_comment: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.comments && this.comments.length && this.comments[this.comments.length - 1] || null
      },
      set () {
        throw new Error('Do not try to set the `last_comment` value!')
      }
    },
    customer_name: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.customer.full_name || ''
      },
      set () {
        throw new Error('Do not try to set the `customer_name` value!')
      }
    },
    customer_phone: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.customer && this.customer.phones.length && this.customer.phones[this.customer.phones.length - 1].number || ''
      },
      set () {
        throw new Error('Do not try to set the `customer_phone` value!')
      }
    }
  }, {
    sequelize,
    modelName: 'Subscribe',
    tableName: 'subscribes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Subscribe;
};
