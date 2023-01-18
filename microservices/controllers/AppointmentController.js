const models = require('../models')
const Appointment = models.Appointment
const { Op } = require("sequelize")
const moment = require('moment')

const firstWeekDay = date => moment(date).day(1).format('YYYY-MM-DD')
const lastWeekDay = date => moment(date).day(8).format('YYYY-MM-DD')

const index = async data => {
    try {
        let where
        switch (data.mode) {
            case 'month':
                let dateArr = data.date.split('-')
                dateArr.pop()
                let month = dateArr.join('-')
                where = {[Op.and]: [{date: {[Op.startsWith]: month}}, {island_id: data.island_id}]}
                break
            case 'week':
                where = {
                    [Op.and]: [
                        {date: {[Op.between]: [firstWeekDay(data.date), lastWeekDay(data.date)]}},
                        {island_id: data.island_id}
                    ]
                }
                break
            case 'day':
                where = {[Op.and]: [{date: {[Op.startsWith]: data.date}}, {island_id: data.island_id}]}
                break
            default: return Promise.reject(new Error('Не указан период для загрузки записей'))
        }
        let appointments = await Appointment.findAll({where: where, include: {all: true}})
        return Promise.resolve(appointments)
    } catch (e) {
        return Promise.reject(e)
    }
}

const create = async data => {
    try {
        const event = await Appointment.create({...data})
        await event.reload({include: {all: true}})
        const info = {text: `Запись на ${moment(data.date).format('DD-MM-YYYY HH:mm')} добавлена`}
        return Promise.resolve({event, info})
    } catch (e) {
        return Promise.reject(new Error(`Creating appointment failed: ${e}`))
    }
}

module.exports = {
    index,
    create
}
