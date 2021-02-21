const { Op } = require("sequelize")
const models = require('../models')
const Deal = models.Deal
const DealAction = models.DealAction
const Subscribe = models.Subscribe
const Product = models.Product
const Type = models.Type
const Size = models.Size
const StockAction = models.StockAction


const index = async data => {
    try {
        let where
        data.island_id ?
            where = {[Op.and]: [{created_at: {[Op.startsWith]: data.date}}, {island_id: data.island_id}]} :
            where = {created_at: {[Op.startsWith]: data.date}}
        let deals = await Deal.findAll({where: where,include: {all: true}, order: [['id', 'ASC']]})
        return Promise.resolve(deals)
    } catch (e) {
        return Promise.reject(e)
    }
}

const updatePaymentType = async data => {
    try {
        let deal = await Deal.findByPk(data.deal_id, {include: {all: true}})
        deal.is_cache = data.is_cache
        await deal.save()
        return Promise.resolve(deal)
    } catch (e) {
        return Promise.reject(e)
    }
}

const create = async data => {
    try {
        let stockAction
        const newDealAction = await DealAction.findByPk(data.deal_action_id)
        if (['correction', 'prodDefect', 'islandDefect', 'alteration'].includes(newDealAction.type)) {
            data.income = data.expense = 0
        } else if (newDealAction.type === 'return') {
            data.expense = data.income
            data.income = 0
        }
        let dealParams = JSON.parse(JSON.stringify(data))
        delete dealParams.start_date
        const {id} = await Deal.create({...dealParams})
        const deal = await Deal.findByPk(id, {include: {all: true}})
        const info = {text: `Сделка №${deal.id} на ${deal.income}р. добавлена`}
        if (deal.action_type === 'subscribe') {
            await Subscribe.create({
                island_id: data.island_id,
                user_id: data.user_id,
                customer_id: data.customer_id,
                subscription_id: data.subscription_id,
                start_date: data.start_date
            })
        }
        if (!['correction', 'subscribe', 'service', 'return'].includes(deal.action_type)) {
            let comment
            const product = await Product.findByPk(data.product_id)
            if (product.description === 'good') {
                comment = `${deal.action.text} ${product.name}`
            } else {
                const type = await Type.findByPk(data.type_id)
                const size = await Size.findByPk(data.size_id)
                comment = `${deal.action.text} ${product.name} ${type.name} ${size.name}`
            }
            const {id} = await deal.createStockAction({
                user_id: data.user_id,
                type: 'expense',
                island_id: data.island_id,
                product_id: data.product_id,
                type_id: data.type_id,
                size_id: data.size_id,
                count: 1,
                comment: comment
            })
            stockAction = await StockAction.findByPk(id, {include: {all: true}})
        }
        return Promise.resolve({deal, info, stockAction})
    } catch (e) {
        return Promise.reject(new Error(`Error creating deal: ${e}`))
    }
}

const update = async data => {
    try {
        let inputs = {}
        const fields = ['user_id', 'island_id', 'customer_id', 'income', 'expense', 'is_cache', 'deal_action_id',
            'product_id', 'type_id', 'size_id', 'subscription_id', 'service_id']
        for (let key in data) {
            fields.includes(key) ? inputs[key] = data[key] : null
        }
        const deal = await Deal.findByPk(data.id)
        await deal.update({...inputs})
        await deal.reload({include: {all: true}})
        const info = {text: 'Данные сделки обновлены'}
        return Promise.resolve({deal, info})
    } catch (e) {
        return Promise.reject(new Error(`Update deal failed: ${e}`))
    }
}

const remove = async data => {
    try {
        const deal = await Deal.findByPk(data.id, {include: {all: true}})
        const info = {text: `Сделка ${deal.insole} на ${deal.income}р. удалена`}
        const dealId = deal.id
        deal.stockAction ? await deal.stockAction.destroy() : null
        deal.certificate ? await deal.certificate.destroy() : null
        await deal.destroy()
        return Promise.resolve({info, dealId})
    } catch (e) {
        return Promise.reject(new Error(`Remove deal failed: ${e}`))
    }
}

module.exports = {
    updatePaymentType,
    index,
    create,
    update,
    remove
}
