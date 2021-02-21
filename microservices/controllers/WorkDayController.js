const { Op } = require("sequelize")
const models = require('../models')
const WorkDay = models.WorkDay
const moment = require('moment')

const now = () => moment().format('YYYY-MM-DD HH:mm:ss')

const index = async data => {
    try {
        const include = ['user']
        const order = [['id', 'ASC']]
        let where
        data.island_id ?
            where = {[Op.and]: [{date: {[Op.startsWith]: data.date}}, {island_id: data.island_id}]} :
            where = {date: {[Op.startsWith]: data.date}}
        return Promise.resolve(await WorkDay.findAll({where, include, order}))
    } catch (e) {
        return Promise.reject(e)
    }
}

const create = async data => {
    try {
        let workDay = await WorkDay
            .create({
                island_id: data.island_id,
                user_id: data.user_id,
                date: now().split(' ')[0],
                time_start: now().split(' ')[1]
            })
        let workdayId = workDay.id
        let result =  await WorkDay.findByPk(workdayId, {include: ['user']})
        return Promise.resolve(result)
    } catch (e) {
        return Promise.reject(e)
    }
}

const startUserDay = async data => {
    try {
        let info
        let workday
        const today = now().split(' ')[0]
        const currentWorkDay = await WorkDay.findOne({
            where: {island_id: data.island_id, date: {[Op.startsWith]: today}, user_id: data.user_id},
            include: ['user']
        })
        currentWorkDay ? await currentWorkDay.destroy() : null
        workday = await create(data)
        info = {text: `Добро пожаловать, ${workday.user.first_name} ${workday.user.patronymic}!`}
        return Promise.resolve({workday, info})
    } catch (e) {
        return Promise.reject(new Error(`Error starting user work day: ${e}`))
    }
}

const resumeUserDay = async data => {
    try {
        const today = now().split(' ')[0]
        const workday = await WorkDay.findOne({
            where: {island_id: data.island_id, date: {[Op.startsWith]: today}, user_id: data.user_id},
            include: ['user']
        })
        await workday.update({time_finish: null})
        const info = {text: `С возвращением, ${workday.user.first_name} ${workday.user.patronymic}!`}
        return Promise.resolve({workday, info})
    } catch (e) {
        return Promise.reject(new Error(`Resume user workday failed: ${e}`))
    }
}

const finishUserDay = async data => {
    try {
        const today = now().split(' ')[0]
        const time_end = now().split(' ')[1]
        const workday = await WorkDay.findOne({where: {
            date: {[Op.startsWith]: today},
            island_id: data.island_id,
            user_id: data.user_id
        }, include: ['user']})
        const info = {text: `Спасибо за работу, ${workday.user.first_name} ${workday.user.patronymic}`}
        await workday.update({time_finish: time_end, working_hours: data.working_hours})
        return Promise.resolve({workday, info})
    } catch (e) {
        return Promise.reject(new Error(`Finish user day failed: ${e}`))
    }
}

const finishAnotherUserDay = async data => {
    try {
        const workDay = await WorkDay.findByPk(data.id, {include: ['user']})
        await workDay.update({working_hours: data.working_hours, time_finish: moment().format('HH:mm')})
        const info = {text: `Завершен рабочий день сотрудника ${workDay.user.full_name}`}
        const mutations = [{name: 'UPDATE_WORKDAY', data: workDay}]
        const conditions = [{name: 'workingIslandId', compare: 'includes', value: [0, workDay.island_id]}]
        return Promise.resolve({mutations, conditions, info})
    } catch (e) {
        return Promise.reject(new Error(`Finish another user day failed: ${e}`))
    }
}

const resumeAnotherUserDay = async data => {
    try {
        const workDay = await WorkDay.findByPk(data.id, {include: ['user']})
        await workDay.update({time_finish: null})
        const info = {text: `Рабочий день сотрудника ${workDay.user.full_name} возобновлен`}
        const mutations = [{name: 'UPDATE_WORKDAY', data: workDay}]
        const conditions = [{name: 'workingIslandId', compare: 'includes', value: [0, workDay.island_id]}]
        return Promise.resolve({mutations, conditions, info})
    } catch (e) {
        return Promise.reject(new Error(`Resume another user day failed: ${e}`))
    }
}

module.exports = {
    index,
    create,
    startUserDay,
    resumeUserDay,
    finishUserDay,
    finishAnotherUserDay,
    resumeAnotherUserDay
}

