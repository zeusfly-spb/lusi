const { Op } = require("sequelize")
const moment = require('moment')
const models = require('../models')
const StockAction = models.StockAction

const index = async data => {
    try {
        const day = moment(data.date).format('YYYY-MM-DD')
        const include = ['product', 'size', 'user']
        let where = {created_at: {[Op.startsWith]: day}}
        data.island_id ? where.island_id = data.island_id : null
        return Promise.resolve(await StockAction.findAll({where, include}))
    } catch (e) {
        return Promise.reject(new Error(`Error loading StockActions: ${e}`))
    }
}

module.exports = {
    index
}
