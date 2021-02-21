const axios = require('axios')
const moment = require('moment')
const models = require('../models')
const SmsReport = models.SmsReport
const Island = models.Island
const NotifyTemplate = models.NotifyTemplate

const sendSms = async data => {
    try {
        const form_params = {
            base_type: 'isi',
            user_id: data['user_id'] || 0,
            extension: data['extension'],
            phone: data['phone'],
            text: data['text']
        }
        const response = await axios.post('https://crmkin.ru/tel/api/vpbx/sms/send', {...form_params})
        if (response.status === 200) {
            await SmsReport.create({
                number: data['phone'],
                text: data['text'],
                user_id: data['user_id'] || 0,
                island_id: data['island_id'] || 0
            })
            
        }
        return Promise.resolve(response.status)
    } catch (e) {
        return Promise.reject(new Error(`Send sms error: ${e}`))
    }
}

const substituteEventText = ({text = '', event = null}) => {
    if (!event || !event.date) {
        return text
    }
    const time = moment(event.date).format('HH:mm')
    const date = moment(event.date).format('DD/MM/YYYY')
    let result = text.replace('||TIME||', time)
    return result.replace('||DATE||', date)
}

const eventCreatedNotify = async event => {
    try {
        const island = await Island.findByPk(event.island_id)
        const templateId = island && island.options && island.options['CreateNotifyTemplateId'] || null
        if (+templateId) {
            const notifyTemplate = await NotifyTemplate.findByPk(+templateId)
            await sendSms({
                extension: '951',
                island_id: event.island_id,
                user_is: 0,
                phone: `+7${event.client_phone}`,
                text: substituteEventText({text: notifyTemplate.text, event: event})
            })
            return Promise.resolve('Noify sent')
        }
        return Promise.resolve(null)
    } catch (e) {
        return Promise.reject(new Error(`Event created notyfy error: ${e}`))
    }
}

module.exports = {
    sendSms,
    substituteEventText,
    eventCreatedNotify
}   