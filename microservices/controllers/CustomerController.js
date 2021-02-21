const { Op } = require("sequelize")
const models = require('../models')
const Customer = models.Customer
const SmsReport = models.SmsReport

const index = async data => {
    try {
        const customers =  await Customer.findAll({
            where: {created_at: {[Op.startsWith]: data.date}},
            include: {all: true}
        })
        const mutations = [{name: 'SET_CUSTOMERS', data: customers}]
        return Promise.resolve({mutations})
    } catch (e) {
        return Promise.reject(new Error(`Load customers failed: ${e}`))
    }
}

const sentMessages = async data => {
    try {
        const customer = await Customer.findByPk(data.customer_id, {include: ['phones']})
        const phoneNumbers = customer.phones.map(item => `+7${item.number}`)
        const sent_messages = await SmsReport.findAll({where: {number: phoneNumbers}})
        const lead_id = data.lead_id
        const response = {lead_id, sent_messages}
        const mutations = [{name: 'UPDATE_LEAD_CUSTOMER', data: response}]
        return Promise.resolve(mutations)
    } catch (e) {
        return Promise.reject(new Error(`Load customers sent messages failed: ${e}`))
    }
}

module.exports = {
    index,
    sentMessages
}
