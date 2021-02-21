const CONFIG = require('./config')
const TelephonyController = require('./controllers/TelephonyController')
const { broadcast } = require('./transmitter')

const performLead = event => event.type === 'INSERT' && event.affectedRows[0].after.status === 'wait' ?
    broadcast(JSON.stringify({type: 'add_lead', model: event.affectedRows[0].after})) : null

const performAppointment = event => {
    if (event.type !== 'INSERT') {
        return;
    }
    event = event.affectedRows[0].after
    TelephonyController.eventCreatedNotify(event)
}

const inspect = event => {
    if (event.schema !== CONFIG.db_name) {
        return
    }
    switch (event.table) {
        case 'appointments':
            performAppointment(event)
            break
        case 'leads':
            performLead(event)
            break
        default: break
    }
}

module.exports = {
    inspect
}
