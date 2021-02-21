const moment = require('moment')
const WorkDayController = require('./controllers/WorkDayController')
const DealController = require('./controllers/DealController')
const AppointmentController = require('./controllers/AppointmentController')
const SalaryController = require('./controllers/SalaryController')
const LoaderController = require('./controllers/LoaderController')
const LeadController = require('./controllers/LeadController')
const SubscribeController = require('./controllers/SubscribeController')
const StockActionsController = require('./controllers/StockActionController')
const ExpenseController = require('./controllers/ExpenseController')
const CustomerController = require('./controllers/CustomerController')
const CertificateController = require('./controllers/CertificateController')

const clearDate = date => moment(date).format('YYYY-MM-DD')



const parse = async message => {
    try {
        const resume_another_user_day = async model => {
            const {mutations, conditions, info} = await WorkDayController.resumeAnotherUserDay({...model})
            return Promise.resolve({
                response: Instruction({info}),
                broadcast: Instruction({mutations, conditions})
            })
        }
        const finish_another_user_day = async model => {
            const {mutations, conditions, info} = await WorkDayController.finishAnotherUserDay({...model})
            return Promise.resolve({
                response: Instruction({info}),
                broadcast: Instruction({mutations, conditions})
            })
        }
        const load_stock_page = async model => {
            const {mutations} = await LoaderController.loadStockPage({...model})
            return Promise.resolve({
                response: Instruction({mutations}),
                broadcast: null
            })
        }
        const get_certificates = async model => {
            const {mutations} = await CertificateController.index({...model})
            return Promise.resolve({
                response: Instruction({mutations}),
                broadcast: null
            })
        }
        const add_certificate_comment = async model => {
            const {mutations, conditions, info} = await CertificateController.addComment({...model})
            return Promise.resolve({
                response: Instruction({info}),
                broadcast: Instruction({mutations, conditions})
            })
        }
        const delete_certificate_comment = async model => {
            const {mutations, conditions, info} = await CertificateController.deleteComment({...model})
            return Promise.resolve({
                response: Instruction({info}),
                broadcast: Instruction({mutations, conditions})
            })
        }
        const create_certificate = async model => {
            const {mutations, conditions, info} = await CertificateController.create({...model})
            return Promise.resolve({
                response: Instruction({info}),
                broadcast: Instruction({mutations, conditions})
            })
        }
        // implementation

        const frame = JSON.parse(message)
        const Instruction = ({ mutations, conditions, info }) => {
            let response ={
                type: 'instruction',
                model: { mutations, conditions, info}
            }
            if (frame.request && frame.request.id) {
                response.response = {id: frame.request.id}
            }
            return JSON.stringify(response)
        }

        let responseFrame
        let mutation, mutations, conditions, data
        switch (frame.type) {
            case 'request_create_certificate':
                return Promise.resolve(await create_certificate({...frame.model}))
            case 'request_delete_certificate_comment':
                return Promise.resolve(await delete_certificate_comment({...frame.model}))
            case 'request_add_certificate_comment':
                return Promise.resolve(await add_certificate_comment({...frame.model}))
            case 'request_get_certificates':
                return Promise.resolve(await get_certificates({...frame.model}))
            case 'request_load_stock_page':
                return Promise.resolve(await load_stock_page({...frame.model}))
            case 'request_resume_another_user_day':
                return  Promise.resolve(await resume_another_user_day({...frame.model}))
            case 'finish_another_user_day':
                return Promise.resolve(await finish_another_user_day({...frame.model}))

            case 'request_get_customer_sent_messages':
                mutations = await CustomerController.sentMessages({...frame.model})
                return Promise.resolve({
                    response: Instruction({mutations}),
                    broadcast: null
                })

            case 'request_get_customers':
                const request_get_customers = async model => {
                    const {mutations} = await CustomerController.index({...model})
                    return Promise.resolve({
                        response: Instruction({mutations}),
                        broadcast: null
                    })
                }
                return Promise.resolve(await request_get_customers({...frame.model}))

            case 'request_delete_deal':
                data = await DealController.remove({...frame.model})
                mutations = [{name: 'DELETE_DEAL', data: data.dealId}]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations})
                })
            case 'request_update_deal':
                data = await DealController.update({...frame.model})
                mutations = [{name: 'UPDATE_DEAL', data: data.deal}]
                conditions = [
                    {name: 'accountingDate', value: clearDate(data.deal.created_at), compare: 'equal'},
                    {name: 'workingIslandId', value: [0, data.deal.island_id], compare: 'includes'}
                ]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_add_appointment':
                data = await AppointmentController.create({...frame.model})
                mutations = [{name: 'ADD_APPOINTMENT', data: data.event}]
                conditions = [{name: 'workingIslandId', value: data.event.island_id, compare: 'equal'}]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_delete_expense':
                data = await ExpenseController.remove({...frame.model})
                mutations = [{name: 'DELETE_EXPENSE', data: data.expense.id}]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_add_expense':
                data = await ExpenseController.create({...frame.model})
                mutations = [{name: 'ADD_EXPENSE', data: data.expense}]
                conditions = [
                    {name: 'accountingDate', value: clearDate(data.expense.created_at), compare: 'equal'},
                    {name: 'workingIslandId', value: [0, data.expense.island_id], compare: 'includes'}
                ]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_finish_user_day':
                data = await WorkDayController.finishUserDay({...frame.model})
                mutations = [{name: 'UPDATE_WORK_DAY', data: data.workday}]
                conditions = [
                    {name: 'accountingDate', value: data.workday.date, compare: 'equal'},
                    {name: 'workingIslandId', value: [0, data.workday.island_id], compare: 'includes'}
                ]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_resume_user_day':
                data = await WorkDayController.resumeUserDay({...frame.model})
                mutations = [{name: 'UPDATE_WORK_DAY', data: data.workday}]
                conditions = [
                    {name: 'accountingDate', value: data.workday.date, compare: 'equal'},
                    {name: 'workingIslandId', value: [0, data.workday.island_id], compare: 'includes'}
                ]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_start_user_day':
                data = await WorkDayController.startUserDay({...frame.model})
                mutations = [{name: 'ADD_WORK_DAY', data: data.workday}]
                conditions = [
                    {name: 'isToday', value: true, compare: 'equal'},
                    {name: 'currentPage', value: 'daily', compare: 'equal'},
                    {name: 'workingIslandId', value: [0, data.workday.island_id], compare: 'includes'},
                ]
                return Promise.resolve({
                    response: Instruction({info: data.info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_get_stock_actions':
                mutations = [{name: 'SET_STOCK_ACTIONS', data: await StockActionsController.index({...frame.model})}]
                return Promise.resolve({
                    response: Instruction({mutations}),
                    broadcast: null
                })
            case 'request_add_deal':
                let {deal, info, stockAction} = await DealController.create({...frame.model})
                mutations = [{name: 'ADD_DEAL', data: deal}]
                conditions = [
                    {name: 'accountingDate', value: moment(deal.created_at).format('YYYY-MM-DD'), compare: 'equal'},
                    {name: 'workingIslandId', value: [0, deal.island_id], compare: 'includes'},
                ]
                stockAction ? mutations.push({name: 'ADD_STOCK_ACTION', data: stockAction}) : null
                return Promise.resolve({
                    response: Instruction({info}),
                    broadcast: Instruction({mutations, conditions})
                })
            case 'request_get_inactive_subscribes':
                mutations = [{name: 'SET_INACTIVE_SUBSCRIBES', data: await SubscribeController.inactive({...frame.model})}]
                return Promise.resolve({
                    response: Instruction({mutations}),
                    broadcast: null
                })
            case 'request_get_all_subscribes':
                mutations = [{name: 'SET_ALL_SUBSCRIBES', data: await SubscribeController.all({...frame.model})}]
                return Promise.resolve({
                    response: Instruction({mutations}),
                    broadcast: null
                })
            case 'request_get_subscribes':
                mutations = [{name: 'SET_SUBSCRIBES', data: await SubscribeController.index({...frame.model})}]
                return Promise.resolve({
                    response: Instruction({mutations}),
                    broadcast: null
                })
            case 'request_get_leads':
                const response = await LeadController.index({...frame.model})
                mutations = [
                    {name: 'SET_COUNTS', data: response.counts},
                    {name: 'SYNC_PAGINATION', data: response.paginator_data},
                    {name: 'SET_LEADS', data: response.leads}
                ]
                frame.model.call_today ? mutations.push({name: 'SET_CALL_TODAY_LEADS', data: response.leads}) : null
                return Promise.resolve({
                    response: Instruction({mutations}),
                    broadcast: null
                })
            case 'request_update_deal_payment':
                mutations = [
                    {name: 'UPDATE_DEAL', data: await DealController.updatePaymentType({...frame.model})}
                ]
                let instruction = Instruction({ mutations })
                return Promise.resolve({
                    response: null,
                    broadcast: instruction
                })
            case 'request_load_daily_page':
                mutations = [
                    { name: 'SET_DAILY_PAGE', data: await LoaderController.loadDailyPage({... frame.model})}
                ]
                return Promise.resolve({
                    response: Instruction({ mutations }),
                    broadcast: null
                })
            case  'request_get_side_panel_events':
                mutations = [
                    { name: 'SET_SIDE_PANEL_EVENTS', data: await AppointmentController.index({...frame.model, mode: 'day'}) }
                ]
                return Promise.resolve({
                    response: Instruction({ mutations }),
                    broadcast: null
                })
            case 'request_get_month_data':
                mutations = [
                    { name: 'SET_MONTH_DATA', data: await SalaryController.retrieveMonthData({...frame.model})}
                ]
                return Promise.resolve({
                    response: Instruction({ mutations }),
                    broadcast: null
                })
            case 'request_get_appointments':
                mutations = [
                    { name: 'SET_APPOINTMENTS', data: await AppointmentController.index({...frame.model}) }
                ]
                return Promise.resolve({
                    response: Instruction({ mutations }),
                    broadcast: null
                })
            case 'request_get_workdays':
                mutations = [
                    { name: 'SET_WORK_DAYS', data: await WorkDayController.index({...frame.model})}
                ]
                return Promise.resolve({
                    response: Instruction({ mutations }),
                    broadcast: null
                })
            case 'close_active_sessions':
                return Promise.resolve({
                    response: null,
                    broadcast: null
                })
            case 'request_get_active_clients':
                return Promise.resolve({
                    response: null,
                    broadcast: null
                })
            case 'request_start_workday':
                let workday = await WorkDayController.create({...frame.model})
                responseFrame = {
                    type: 'add_workday',
                    model: workday
                }
                if (frame.request) {
                    responseFrame.response = {
                            id: frame.request.id,
                            info: `Начат рабочий день для сотрудника ${workday.user.full_name || ''}`
                        }
                }
                return Promise.resolve({
                    response: null,
                    broadcast: JSON.stringify(responseFrame)
                })
            case 'request_get_deals':
                let deals = await DealController.index({...frame.model})
                mutation = {name: 'SET_DEALS', data: deals}
                responseFrame = {
                    type: 'instruction',
                    model: {
                        mutations: [mutation]
                    }
                }
                if (frame.request) {
                    responseFrame.response = { id: frame.request.id }
                }
                return Promise.resolve({
                    response: JSON.stringify(responseFrame),
                    broadcast: null
                })
            default:
                return Promise.resolve({
                    response: null,
                    broadcast: message
                })
        }
    } catch (e) {
        Promise.reject(e)
    }
}

module.exports = {
    parse
}
