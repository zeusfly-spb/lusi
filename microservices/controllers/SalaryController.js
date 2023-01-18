const { Op } = require("sequelize");
const models = require('../models')
const User = models.User
const Deal = models.Deal
const Island = models.Island
const Appointment = models.Appointment
const cache = require('../cache')
const chalk = require('chalk')

const cacheKey = ({date, island_id}) => `salary:${month(date)}:${island_id}`

const monthDayCount = date => {
    if (date.split('-')[1] === '02') {
        return +date.split('-')[0] % 4 === 0 ? 29 : 28
    }
    return ['04', '06', '09', '11'].includes(date.split('-')[1]) ? 30 : 31
}

const monthDates = date => Array(monthDayCount(date))
        .fill(1)
        .map((item, index) => index + 1)
        .map(day => day < 10 ? `0${day}` : day)
        .map(day => `${date.split('-')[0]}-${date.split('-')[1]}-${day}`)

const month = date => `${date.split('-')[0]}-${date.split('-')[1]}`

const retrieveMonthData = async ({date, island_id = 0, internal = false}) => {
    try {
        const userInclude = [
            {association: 'workdays', separate: true},
            {association: 'prizes', separate: true},
            {association: 'forfeits', separate: true},
            {association: 'sicks', separate: true},
            {association: 'prepays', separate: true},
            {association: 'vacations', separate: true},
            {association: 'controlled_islands', separate: true},
            {association: 'group'},
            {association: 'islands'},
        ]
        const dates = monthDates(date)
        const islandId = +island_id
        const island = islandId ? await Island.findByPk(islandId, {include: ['users', 'workdays']}) : null
        let commonWhere
        if (!islandId) {
            commonWhere = { created_at: { [Op.startsWith]: month(date) } }
        } else {
            commonWhere = { [Op.and]: [
                    { created_at: { [Op.startsWith]: month(date) } },
                    { island_id: islandId }
                ] }
        }
        const allDeals = await Deal.findAll({where: commonWhere, include: ['user', 'action', 'product', 'type', 'size']})
        const allAppointments = await Appointment.findAll({where: commonWhere})
        let usersMainWhere = { [Op.or]: [
                {fired_at: { [Op.is]: null } },
                {fired_at: { [Op.between]: [dates[0], dates[dates.length - 1]] } },
                {created_at: { [Op.between]: [dates[0], dates[dates.length - 1]] } }
            ]}
        let users
        if (island) {
            let userIds
            let salaryDisplay = island.options && island.options.salary_display || 'attach'
            switch (salaryDisplay) {
                case 'attach':
                    userIds = island.users.map(user => +user.id)
                    break
                case 'time':
                    userIds = island.workdays
                        .filter(workday => workday.created_at >= dates[0] && workday.created_at <= dates[dates.length - 1])
                        .map(item => +item.user_id)
                    break
                case 'attach_time':
                    let attached = island.users.map(user => +user.id)
                    let byTime = island.workdays
                        .filter(workday => workday.created_at >= dates[0] && workday.created_at <= dates[dates.length - 1])
                        .map(item => +item.user_id)
                    userIds = [... attached, ... byTime]
                    break
                case 'selected':
                    userIds = island.options && island.options.selected_user_ids || []
                    break
            }
            users = await User.findAll({
                where: { [Op.and]: [{id: userIds}, usersMainWhere] },
                include: userInclude
            })
        } else {
            users = await User.findAll({where: usersMainWhere, include: userInclude})
            users = users.filter(item => item.islands.length > 0)
        }
        let monthData = {
            allDeals,
            dates,
            users,
            allAppointments
        }
        return Promise.resolve(monthData)
    } catch (e) {
        return Promise.reject(new Error('Ошибка получения данных месяца: ' + e))
    }
}

const cacheMonthData = async ({date, island_id = 0}) => {
    try {
        await cache.Set(cacheKey({date, island_id}), JSON.stringify(await retrieveMonthData({date, island_id, internal: true})))
        console.log(chalk.white.bold.bgBlue(`Cached month data in "${cacheKey({date, island_id})}"`))
        return Promise.resolve('OK')
    } catch (e) {
        return Promise.reject(new Error('Ошибка кеширования данных месяца: ' + e))
    }
}

module.exports = {
    retrieveMonthData,
    cacheMonthData
}
