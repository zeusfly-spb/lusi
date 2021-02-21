'use strict';
const moment = require('moment')
const {v4} = require('uuid')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Certificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Certificate.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
      })
    }

    static async create (values, options) {
      try {
        return Promise.resolve(await super.create({
          ...values,
          created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
          updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, options))
      } catch (e) {
        return Promise.reject(new Error(`Create Certificate error: ${e}`))
      }
    }
    async update (values, options) {
      try {
        return Promise.resolve(await super.update({
          ...values,
          updated_at: moment().format('YYYY-MM-DD HH:mm:ss')
        }, options))
      } catch (e) {
        return Promise.reject(new Error(`Certificate update error: ${e}`))
      }
    }
  };
  Certificate.init({
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    island_id: {type: DataTypes.BIGINT, allowNull: false},
    user_id: {type: DataTypes.BIGINT, allowNull: false},
    customer_id: {type: DataTypes.BIGINT, allowNull: false},
    deal_id: {type: DataTypes.BIGINT, allowNull: false},
    nominal: {type: DataTypes.INTEGER, allowNull: false},
    start_date: {type: DataTypes.DATEONLY, allowNull: false},
    duration: {type: DataTypes.INTEGER, allowNull: false},
    history: DataTypes.JSON,
    comments: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.history && this.history.comments || []
      },
      set () {
        throw new Error('Do not try to set the `comments` value!')
      }
    },
    writeoffs: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.history && this.history.writeoffs || []
      },
      set () {
        throw new Error('Do not try to set the `writeoffs` value!')
      }
    },
    created_at:DataTypes.STRING,
    updated_at: DataTypes.STRING,
    finish_date: {
      type: DataTypes.VIRTUAL,
      get () {
        return moment(this.start_date).add(this.duration, 'days').format('YYYY-MM-DD')
      },
      set () {
        throw new Error('Do not try to set the `finish_date` value!')
      }
    },
    last_comment: {
      type: DataTypes.VIRTUAL,
      get () {
        return this.comments.length && this.comments[0] || null
      },
      set () {
        throw new Error('Do not try to set the `last_comment` value!')
      }
    }
  }, {
    sequelize,
    modelName: 'Certificate',
    tableName: 'certificates',
    timestamps: false
  });
  Certificate.prototype.addComment = async function ({text = '', user_id }) {
    if (!text.length) {
      return new Error('Comment text length can`t be 0')
    }
    const before = this.comments
    const comment = {
      id: v4(),
      text,
      user_id,
      created_at: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    const after = [comment, ...before]
    this.update({history: {... this.history, comments: after}})
  }
  Certificate.prototype.deleteComment = async function ({id = null}) {
    if (!id || !this.comments.length) {
      return new Error('Can`t delete certificates comment')
    }
    this.update({history: {... this.history, comments: this.comments.filter(item => item.id !== id)}})
  }
  Certificate.prototype.addWriteoff = function ({amount, user_id}) {
    try {
      [amount, user_id].forEach(item => {
        if (!item) {
          throw new Error(`Not enough data item`)
        }
      })
      const newWriteoff = {
        amount,
        user_id,
        id: v4(),
        created_at: moment().format('YYYY-MM-DD HH:mm:ss')
      }
      this.update({history: {... this.history, writeoffs: [...this.writeoffs, newWriteoff]}})
    } catch (e) {
      return new Error(`Error adding writeoff into certificate: ${e}`)
    }
  }
  Certificate.prototype.deleteWriteoff = function ({id = null}) {
    try {
      this.update({history: {... this.history, writeoffs: this.writeoffs.filter(item => item.id !== id)}})
    } catch (e) {
      return new Error(`Error deleting writeoff from certificate ${e}`)
    }
  }
  return Certificate;
};
