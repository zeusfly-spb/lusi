const moment = require('moment')
const { Op } = require("sequelize")
const models = require('../models')
const WorkDay = models.WorkDay
const Deal = models.Deal
const Expense = models.Expense
const HandOver = models.HandOver
const Setting = models.Setting
const Island = models.Island
const Reserve = models.Reserve
const StockAction = models.StockAction
const Product = models.Product
const Type = models.Type
const Size = models.Size
const DealAction = models.DealAction

const loadStockPage = async ({date, island_id = 0}) => {
    try {
        let where = {created_at: {[Op.startsWith]: date}}
        if (+island_id) {
            where.island_id = island_id
        }
        const reserves = await Reserve.findAll({where, include: {all: true}})
        const stock_actions = await StockAction.findAll({where, include: ['product', 'size', 'user']})
        const stock_options = {
            products: await Product.findAll(),
            types: await Type.findAll(),
            sizes: await Size.findAll(),
            deal_actions: await DealAction.findAll()
        }
        const mutations = [
            {name: 'SET_RESERVES', data: reserves},
            {name: 'SET_STOCK_ACTIONS', data: stock_actions},
            {name: 'SET_STOCK_OPTIONS', data: stock_options},
            {name: 'REMOVE_TASK', data: 'stock' }
        ]
        return Promise.resolve({mutations})
    } catch (e) {
        return Promise.reject(new Error(`Error loading Stock Page data: ${e}`))
    }
}

const loadDailyPage = async data => {
    try {
        let workDayWhere = data.island_id ?
            {[Op.and]: [{date: {[Op.startsWith]: data.date}}, {island_id: data.island_id}]} :
            {date: {[Op.startsWith]: data.date}}
        let where = data.island_id ?
            {[Op.and]: [{created_at: {[Op.startsWith]: data.date}}, {island_id: data.island_id}]} :
            {created_at: {[Op.startsWith]: data.date}}
        let workdays = await WorkDay.findAll({where: workDayWhere, include: ['user', 'time_breaks']})
        let deals = await Deal.findAll({where: where, include: {all: true}, order: [['id', 'ASC']]})
        let expenses = await Expense.findAll({where: where, include: ['user']})
        let handovers = data.island_id ? await HandOver.findOne({where: where}) : await HandOver.findAll({where: where})
        let handover = Array.isArray(handovers) ? handovers.reduce((a, b) => a + b.amount, 0) : handovers && handovers.amount || 0
        return Promise.resolve({
            workdays,
            deals,
            expenses,
            handover
        })
    } catch (e) {
        return Promise.reject(new Error(`Ошибка загрузки данных дневного учета:  ${e}`))
    }
}

const priorPrepare = async () => {
    try {
        let date = moment().format('YYYY-MM-DD')
        let islands = await Island.findAll({include: ['users']})
        let result = {date, islands}
        let setting = await Setting.findByPk(1)
        if (setting) {
            result = {... result, setting}
        }
        return Promise.resolve(result)
    } catch (e) {
        return Promise.reject(new Error(`Ошибка начальной подготовки: ${e}`))
    }
}

module.exports = {
    loadStockPage,
    loadDailyPage,
    priorPrepare
}
