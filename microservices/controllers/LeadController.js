const moment = require('moment')
const models = require('../models')
const Lead = models.Lead
const Postpone = models.Postpone
const Phone = models.Phone
const Customer = models.Customer
const Deal = models.Deal
const { Op } = require("sequelize")

const index = async data => {
    try {
        const today = moment().format('YYYY-MM-DD')
        const orders = [['id', 'DESC']]
        let include = ['comments', 'user', 'event', 'postpones',
            {model: Phone, as: 'number', include: [
                {model: Customer, as: 'customer', include: [
                        'phones',
                        {model: Deal, as: 'deals', include: ['action', 'service', 'product', 'type', 'size']}
                    ]}
                ]}
        ]
        let where = {}
        let paginatorOptions = {
            pageIndex: data.page && data.page - 1 || 0,
            pageSize: data.per_page || 15
        }
        let call_today
        if (data.call_today) {
                let todayPostpones = await Postpone.findAll({
                    where: {date: {[Op.startsWith]: today}},
                    attributes: ['lead_id']
                })
                let todayLeadIds = todayPostpones.map(postpone => postpone.lead_id)
                call_today = await Lead.findAll({
                    where: {id: todayLeadIds, status: 'process'},
                    include
                })
                call_today = call_today.filter(lead => lead.last_postpone_date === today)
        } else {
            !data.name ? where.status = data.status : null
            data.sites && data.sites.length ? where.site = data.sites : null
            if (data.name) {
                where = {... where,[Op.or]: [
                        {name: {[Op.startsWith]: data.name}},
                        {phone: {[Op.endsWith]: data.name}}
                    ]
                }
            }
        }
        let leads
        let response
        if (data.call_today) {
            let startPos = data.page > 1 ? data.per_page * data.page : 0
            leads = call_today.slice(startPos, startPos + data.per_page)
        } else {
            response = await Lead.paginate({... paginatorOptions, where, include, orders})
            leads = response.data
        }

        let counts
        if (data.sites && data.sites.length) {
            counts = {
                all: await Lead.count({where: {site: data.sites}, status: {[Op.ne]: 'done'}}),
                wait: await Lead.count({where: {site: data.sites, status: 'wait'}}),
                process: await Lead.count({where: {site: data.sites, status: 'process'}}),
                done: await Lead.count({where: {site: data.sites, status: 'done'}}),
                moderate: await Lead.count({where: {site: data.sites, status: 'moderate'}}),
            }
        } else {
            counts = {
                all: await Lead.count({where: {status: {[Op.ne]: 'done'}}}),
                wait: await Lead.count({where: {status: 'wait'}}),
                process: await Lead.count({where: {status: 'process'}}),
                done: await Lead.count({where: {status: 'done'}}),
                moderate: await Lead.count({where: {status: 'moderate'}}),
            }
        }
        let paginator_data
        if (data.call_today) {
            paginator_data = {
                total: call_today.length,
                lastPage: Math.floor(call_today.length / data.perPage),
                perPage: data.per_page,
                currentPage: data.page
            }
        } else {
            paginator_data = {
                total: counts[data.status] || null,
                lastPage: response.meta.last,
                perPage: response.meta.pageSize,
                currentPage: response.meta.current + 1
            }
        }
        return Promise.resolve({
            leads,
            paginator_data,
            counts
        })
    } catch (e) {
        return Promise.reject(new Error(`Leads load error: ${e}`))
    }
}

const updateStatus = async data => {
    try {
        const lead = await Lead.findByPk(data.lead_id)
        const oldStatus = lead.status
        await lead.update({status: data.status})
        await lead.reload({include: {all: true}})
        const mutations = [
            {name: 'INCREASE_LEAD_COUNT', data: lead.status},
            {name: 'DECREASE_LEAD_COUNT', data: oldStatus},
        ]
    } catch (e) {
        return Promise.reject(new Error(`Lead status update failed: ${e}`))
    }
}

module.exports = {
    index
}
