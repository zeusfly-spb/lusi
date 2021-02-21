'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Deal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Deal.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
      Deal.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      })
      Deal.belongsTo(models.DealAction, {
        foreignKey: 'deal_action_id',
        as: 'action'
      })
      Deal.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      })
      Deal.belongsTo(models.Type, {
        foreignKey: 'type_id',
        as: 'type'
      })
      Deal.belongsTo(models.Size, {
        foreignKey: 'size_id',
        as: 'size'
      })
      Deal.belongsTo(models.Service, {
        foreignKey: 'service_id',
        as: 'service'
      })
      Deal.hasOne(models.Appointment, {
        foreignKey: 'deal_id',
        as: 'appointment'
      })
      Deal.hasOne(models.StockAction, {
        foreignKey: 'deal_id',
        as: 'stockAction'
      })
      Deal.hasOne(models.Certificate, {
        foreignKey: 'deal_id',
        as: 'certificate'
      })
      Deal.belongsTo(models.Subscription, {
        foreignKey: 'subscription_id',
        as: 'subscription'
      })
    }
  }
  Deal.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {type: DataTypes.BIGINT, allowNull: false},
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    customer_id: DataTypes.BIGINT,
    income: {type: DataTypes.INTEGER, allowNull: false},
    expense: {type: DataTypes.INTEGER, allowNull: false},
    service_id: DataTypes.BIGINT,
    is_cache: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    deal_action_id: {type: DataTypes.BIGINT, allowNull: false},
    product_id: {type: DataTypes.BIGINT, allowNull: false},
    type_id: {type: DataTypes.BIGINT, allowNull: false},
    size_id:  {type: DataTypes.BIGINT, allowNull: false},
    subscription_id: DataTypes.BIGINT,
    action_type: {
      type: DataTypes.VIRTUAL,
      get () {
        return !!this.action && this.action.type || ''
      },
      set (val) {
        throw new Error('Do not try to set the `action_type` value!')
      }
    },
    insole: {
      type: DataTypes.VIRTUAL,
      get() {
        let product = this.product && this.product.name || ''
        let type = this.type && this.type.name || ''
        let size = this.size && this.size.name || ''
        if (this.subscription) {
          return {name: this.subscription.name}
        }
        if (this.certificate) {
          return {name: `Сертификат на ${this.certificate.duration} дн.`}
        }
        if (this.product && this.product.description === 'good') {
          return {name: product}
        }
        return {name: `${product} ${type} ${size}`}
      },
      set (val) {
        throw new Error('Do not try to set the `insole` value!')
      }
    },
    is_service: {
      type: DataTypes.VIRTUAL,
      get () {
        return !!this.service
      },
      set (val) {
        throw new Error('Do not try to set the `service` value!')
      }
    },
    has_appointment: {
      type: DataTypes.VIRTUAL,
      get () {
        return !!this.appointment
      },
      set (val) {
        throw new Error('Do not try to set the `has_appointment` value!')
      }
    }
  }, {
    sequelize,
    modelName: 'Deal',
    tableName: 'deals',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Deal;
};
