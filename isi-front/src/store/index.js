const Cookies = require('js-cookie')
require('dotenv').config()

import Vue from 'vue'
import Vuex from 'vuex'

import stock from './stock'
import salary from './salary'
import spinner from './spinner'
import loader from './loader'
import settings from './settings'
import island from './island'
import catalog from './catalog'
import appointment from './appointment'
import lead from './lead'
import layout from './layout'
import deal from './deal'
import customer from './customer'
import subscribes from './subscribes'
import paginator from './paginator'
import telephony from './telephony'
import informer from './informer'
import ws from './ws'
import callcenter from './callcenter'
import voice from './voice'

Vue.use(Vuex)

export const store = new Vuex.Store({
    modules: {
        stock,
        salary,
        spinner,
        loader,
        settings,
        island,
        catalog,
        appointment,
        lead,
        layout,
        deal,
        customer,
        subscribes,
        paginator,
        telephony,
        informer,
        ws,
        callcenter,
        voice
    },
    state: {
        loading: 0,
        basePath: '',
        authUser: null,
        accountingDate: null,
        users: [],
        groups: [],
        access: null,
        accessRequests: [],
        islands: [],
        insoles: [],
        customers: [],
        workingIslandId: 0,
        workdays: [],
        realDate: null,
        scanMode: {
            workdays: true,
            accesses: false,
            deals: false,
            expenses: false,
            leads: false
        },
        deals: [],
        startBalance: null,
        expenses: [],
        inspectingUserId: null,
        handover: null,
        hDate: (dateString) => {
            let date = new Date(dateString)
            let options = {month: 'short', day: 'numeric', year: 'numeric'}
            return date.toLocaleDateString('ru-RU', options)
        },
        userRate: ({user, island_id, month, rate}) => {
            let targetRates = user.rates && user.rates.filter(item => item.type === rate && item.island_id === island_id) || []
            let accurateRate = targetRates.find(item => item.month === month) || null
            if (accurateRate) {
                return accurateRate.value
            } else {
                targetRates.sort((a, b) => a.month < b.month ? 1 : a.month > b.month ? -1 : 0)
                let prevRate = targetRates.find(item => item.month < month) && targetRates.find(item => item.month < month).value || null
                return prevRate || 0
            }
        }
    },
    actions: {
        addWorkDay ({commit, state}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_workday', {... data, date: state.accountingDate})
                    .then(res => {
                        commit('ADD_WORK_DAY', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateIslandVpbx ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_island_vpbx', {...data})
                    .then(res =>{
                        commit('UPDATE_ISLAND', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        restoreUser ({commit}, userId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/restore_user', {
                    user_id: userId
                })
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        fireUser ({commit, state}, userId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/fire_user', {
                    user_id: userId,
                    date: state.accountingDate
                })
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateWorkDay ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_workday', {...data})
                    .then(res => {
                        commit('UPDATE_WORKDAY', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateDealWithStock ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_deal_with_stock', {...data})
                    .then(res => {
                        // commit('UPDATE_DEAL', res.data)
                        dispatch('pushFrame', {
                            type: 'update_deal',
                            model: res.data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        finishTimeBreak ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/finish_time_break', {
                    work_day_id: this.getters.currentWorkDay.id
                })
                    .then(res => {
                        commit('UPDATE_WORK_DAY', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        startTimeBreak ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/start_time_break', {
                    work_day_id: this.getters.currentWorkDay.id
                })
                    .then(res => {
                        commit('UPDATE_WORK_DAY', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateHandOver ({commit}, amount) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_handover', {
                    date: this.state.accountingDate,
                    island_id: this.state.workingIslandId,
                    amount: amount
                })
                    .then(res => {
                        commit('UPDATE_HAND_OVER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addHandOver ({commit}, amount) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_handover', {
                    amount: amount,
                    user_id: this.state.authUser.id,
                    island_id: this.state.workingIslandId
                })
                    .then(res => {
                        commit('ADD_HAND_OVER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setHandOver ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_handover', {
                    date: this.state.accountingDate,
                    island_id: this.state.workingIslandId
                })
                    .then(res => {
                        commit('SET_HAND_OVER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteDeal ({commit, dispatch}, deal) {
            dispatch('pushFrame', {
                type: 'request_delete_deal',
                model: {...deal}
            })
        },
        updateDeal ({commit, dispatch}, deal) {
            dispatch('pushFrame', {
                type: 'request_update_deal',
                model: {...deal}
            })
        },
        deleteExpense ({commit, dispatch}, expenseId) {
            dispatch('pushFrame', {
                type: 'request_delete_expense',
                model: {id: expenseId}
            })
        },
        addExpense ({commit, state, dispatch}, data) {
            dispatch('pushFrame', {
                type: 'request_add_expense',
                model: {
                    ...data,
                    island_id: state.workingIslandId,
                    user_id: state.authUser.id
                }
            })
        },
        setExpenses ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_expenses', {
                    date: this.state.accountingDate,
                    island_id: this.state.workingIslandId,
                    user_id: this.state.inspectingUserId
                })
                    .then(res => {
                        commit('SET_EXPENSES', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setStartBalance ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/start_balance', {
                    date: this.state.accountingDate,
                    island_id: this.state.workingIslandId
                })
                    .then(res => {
                        commit('SET_START_BALANCE', res.data.amount)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteCustomer ({commit}, customerId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_customer', {customer_id: customerId})
                    .then(() => {
                        commit('DELETE_CUSTOMER', customerId)
                        resolve(customerId)
                    })
                    .catch(e => reject(e))
            })
        },
        addDeal ({commit, dispatch}, deal) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_deal', {...deal})
                    .then(res => {
                        // commit('ADD_DEAL', res.data)
                        if (res.data.action_type === 'certificate') {
                            const newCertData = {
                                island_id: res.data.island_id,
                                user_id: res.data.user_id,
                                customer_id: res.data.customer_id,
                                deal_id: res.data.id,
                                nominal: res.data.income,
                                start_date: res.data.cert_start_date,
                                duration: res.data.cert_duration
                            }
                            dispatch('pushFrame', {
                                type: 'request_create_certificate',
                                model: newCertData
                            })
                        }
                        const frame = {
                            type: 'instruction',
                            model: {
                                mutations: [{name: 'ADD_DEAL', data: res.data}],
                                conditions: [{name: 'workingIslandId', compare: 'includes', value: [0, res.data.island_id]}]
                            }
                        }
                        dispatch('pushFrame', frame)
                            .then(() => dispatch('setStockActions'))
                            .finally(() => resolve(res))
                    })
                    .catch(e => reject(e))
            })
            /*
            dispatch('pushFrame', {
                type: 'request_add_deal',
                model: deal
            })
             */
        },
        setDeals ({dispatch, state}) {
            dispatch('pushFrame', {
                type: 'request_get_deals',
                island_id: state.workingIslandId || null
            })
        },
        startScanTimer ({dispatch}) {
            setInterval(() => {
                if (this.state.scanMode.accesses) {
                    dispatch('setAccesses')
                }
            }, 5000)
        },
        resumeUserDay ({dispatch, state, getters}) {
            dispatch('pushFrame', {
                type: 'request_resume_user_day',
                model: {
                    user_id: state.authUser.id,
                    island_id: getters.callCenter ? getters.inspectingIslandId : state.workingIslandId
                }
            })
        },
        setRealDate ({commit}) {
            commit('ADD_TASK', 'daily')
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_accounting_date')
                    .then(res => {
                        commit('SET_REAL_DATE', res.data.date)
                        if (res.data.setting) {
                            commit('SET_SETTING', res.data.setting)
                        }
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('REMOVE_TASK', 'daily'))
            })
        },
        finishUserDay ({commit, dispatch, state}, data) {
            dispatch('pushFrame', {
                type: 'request_finish_user_day',
                model: {
                    user_id: state.authUser.id,
                    working_hours: data.working_hours,
                    island_id: state.access.island_id
                }
            })
        },
        startUserDay ({dispatch, state}) {
            dispatch('pushFrame', {
                type: 'request_start_user_day',
                model: {
                    user_id: state.authUser.id,
                    island_id: state.access.island_id
                }
            })
        },
        enterCRM ({dispatch, getters, commit}) {
            const loadDailyPage = () => {
                dispatch('loadDailyPage')
                    .then(() => {
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('setCustomers')
                        dispatch('loadStockPage')
                        dispatch('setAppointments')
                        dispatch('setMonthData')
                    })
            }
            const loadCustomersPage = () => {
                commit('ADD_TASK', 'customers')
                dispatch('setCustomers')
                    .then(() => {
                        commit('REMOVE_TASK', 'customers')
                        dispatch('loadDailyPage')
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('loadStockPage')
                        dispatch('setAppointments')
                        dispatch('setMonthData')
                    })
            }
            const loadStockPage = () => {
                dispatch('loadStockPage')
                    .then(() => {
                        dispatch('loadDailyPage')
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('setCustomers')
                        dispatch('setAppointments')
                        dispatch('setMonthData')
                    })
            }
            const loadSalaryPage = () => {
                commit('ADD_TASK', 'salary')
                dispatch('setMonthData')
                    .then(() => {
                        commit('REMOVE_TASK', 'salary')
                        dispatch('loadDailyPage')
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('setCustomers')
                        dispatch('loadStockPage')
                        dispatch('setAppointments')
                    })

            }
            const loadAdminPage = () => {
                commit('ADD_TASK', 'admin')
                dispatch('setUsers')
                    .then(() => dispatch('setGroups')
                        .then(() => {
                            commit('REMOVE_TASK', 'admin')
                            dispatch('loadDailyPage')
                            dispatch('loadStockPage')
                            dispatch('setAppointments')
                        })
                    )
            }
            const loadAppointmentsPage = () => {
                commit('ADD_TASK', 'appointments')
                dispatch('setAppointments')
                    .then(() => {
                        commit('REMOVE_TASK', 'appointments')
                        dispatch('loadDailyPage')
                        dispatch('setCustomers')
                        dispatch('loadStockPage')
                        dispatch('setMonthData')
                        dispatch('setUsers')
                        dispatch('setGroups')
                    })
            }

            dispatch('priorPrepare')
                .then(() => {
                    dispatch('setLeads')
                    dispatch('startScanTimer')
                    switch (getters.currentPage) {
                        case 'daily':
                            loadDailyPage()
                            break
                        case 'customers':
                            loadCustomersPage()
                            break
                        case 'stock':
                            loadStockPage()
                            break
                        case 'salary':
                            loadSalaryPage()
                            break
                        case 'admin':
                            loadAdminPage()
                            break
                        case 'appointments':
                            loadAppointmentsPage()
                            break
                        default:
                            dispatch('setUsers')
                            break
                    }
                })
        },
        setWorkDays ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_workdays', {
                    date: this.state.accountingDate,
                    island_id: this.state.workingIslandId
                })
                    .then(res => {
                        commit('SET_WORK_DAYS', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setWorkingIslandId ({commit, dispatch, getters}, id) {
            commit('SET_WORKING_ISLAND_ID', id)
            dispatch('setAccountingDate')
                .then(() => {
                    dispatch('loadDailyPage')
                        .then(() => {
                            dispatch('setStartBalance')
                            dispatch('loadStockPage')
                            dispatch('setMonthData')
                            dispatch('setAppointments')
                            getters.filterLeads ? dispatch('setLeads') : null // added after made leads filter
                        })
                })
        },
        deleteIsland ({commit}, islandId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_island', {island_id: islandId})
                    .then(res => {
                        commit('DELETE_ISLAND', islandId)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addCustomerPhone ({commit}, params) {
          return new Promise((resolve, reject) => {
              Vue.axios.post('/api/add_phone', {... params})
                  .then(res => {
                      commit('UPDATE_CUSTOMER', res.data)
                      resolve(res)
                  })
                  .catch(e => reject(e))
          })
        },
        deleteCustomerPhone ({commit}, params) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_phone', {...params})
                    .then(res => {
                        commit('UPDATE_CUSTOMER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateCustomer ({commit}, customer) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_customer', {...customer})
                    .then(res => {
                        commit('UPDATE_CUSTOMER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addCustomer ({commit, dispatch}, customer) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/create_customer', {...customer})
                    .then(res => {
                        if (res.data.exists) {
                            dispatch('pushMessage', {
                                color: 'red',
                                text: 'Данный номер телефона уже присутствует в базе клиентов'
                            })
                            resolve(res)
                            return
                        }
                        commit('ADD_CUSTOMER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setCustomers ({commit, state, dispatch}) {
            dispatch('pushFrame', {
                type: 'request_get_customers',
                model: {date: state.accountingDate}
            })
        },
        deleteAccess ({commit}, accessId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_access', {access_id: accessId})
                    .then((res) => {
                        commit('REMOVE_ACCESS_REQUEST', accessId)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addIsland ({commit}, island) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/create_island', {...island})
                    .then(res => {
                        commit('ADD_ISLAND', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setIslands ({commit}) {
            commit('ADD_TASK', 'daily')
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_islands')
                    .then(res => {
                        commit('SET_ISLANDS', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('REMOVE_TASK', 'daily'))
            })
        },
        setAccessRequests ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_accesses')
                    .then(res => {
                        commit('SET_ACCESS_REQUESTS', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        checkAccess: async function ({commit, getters}) {
            if (getters.isSuperadmin) return
            let exists = Cookies.get('isi-access')
            if (!exists) {
                commit('SET_ACCESS', {status: 'none'})
            } else {
                let res = await Vue.axios.post('/api/check_access_status', {device_id: exists})
                commit('SET_ACCESS', res.data.access)
                if (res.data.setting) {
                    commit('SET_SETTING', res.data.setting)
                }
            }
        },
        deleteGroup ({commit}, id) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_group', {id: id})
                    .then(res => {
                        if (res.data.result) {
                            commit('DELETE_GROUP', id)
                            resolve(res)
                        }
                        reject({error: 'Ошибка удаления группы'})
                    })
                    .catch(e => reject(e))
            })
        },
        updateGroup ({commit}, group) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_group', {...group})
                    .then(res => {
                        commit('UPDATE_GROUP', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addGroup ({commit}, group) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/create_group', {...group})
                    .then(res => {
                        commit('ADD_GROUP', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setGroups ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_groups')
                    .then(res => {
                        commit('SET_GROUPS', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteUser ({commit}, id) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_user', {id: id})
                    .then(res => {
                        if (res.data.result) {
                            commit('DELETE_USER', id)
                            commit('APPEND_USER_ISLANDS')
                            resolve(res)
                        }
                    })
                    .catch(e => reject(e))
            })
        },
        updateUser ({commit}, user) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/save_user', user)
                    .then(res => {
                        if (res.data.error) {
                            reject(res.data)
                        }
                        commit('UPDATE_USER', res.data)
                        commit('APPEND_USER_ISLANDS')
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addUser ({commit}, user) {
            return new Promise ((resolve, reject) => {
                Vue.axios.post('/api/register', user)
                    .then(res => {
                        if (res.data.error) {
                            reject(res.data)
                        }
                        commit('ADD_USER', res.data.success.user)
                        commit('APPEND_USER_ISLANDS')
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setUsers ({commit}) {
             Vue.axios.post('/api/get_users')
                 .then(res => {
                     commit('SET_USERS', res.data)
                     commit('APPEND_USER_ISLANDS')
                 })
        },
        logOut ({commit}) {
            commit('AUTH_LOGOUT')
        },
        logIn ({commit, dispatch}, query) {
            return new Promise ((resolve, reject) => {

                commit('SET_STATUS', 'request')
                Vue.axios.post('/api/login', {name: query.name, password: query.password})
                    .then(res => {
                        let token = res.data.success.token

                        let now = new Date()
                        now.setMinutes(1 + now.getMinutes())
                        Cookies.set('isi-token', token, {expires: now, path: '/'})
                        setInterval(() => {
                            let now = new Date()
                            now.setMinutes(1 + now.getMinutes())
                            Cookies.set('isi-token', token, {expires: now, path: '/'})
                        }, 30000)
                        // Cookies.set('isi-token', token)

                        Vue.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
                        dispatch('setAuthUser')
                        resolve (res)
                    })
                    .catch(e => {
                        commit('AUTH_LOGOUT')
                        reject (e)
                    })
            })
        },
        setAuthUser ({commit}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/details')
                    .then(res => {
                        commit('SET_AUTH_USER', res.data.success)
                        resolve(res)
                    })
                    .catch(e => {
                        commit('AUTH_LOGOUT')
                        reject(e)
                    })
            })

        },
        setAccountingDate ({commit, dispatch}) {
            return new Promise((resolve, reject) => {
                // Verify that current date changed
                let tempTime = new Date()
                let localTimeOffset = tempTime.getTimezoneOffset() * 60000
                let now = new Date(tempTime.getTime() - localTimeOffset)
                    .toISOString()
                    .split('T')[0]
                let savedRealDate = Cookies.get('saved_real')
                if (!savedRealDate) {
                    Cookies.set('saved_real', now)
                } else if (savedRealDate < now) {
                    Cookies.set('saved_real', now)
                    Cookies.set('accounting_date', now)
                }
                //
                let savedDate = Cookies.get('accounting_date')
                if (savedDate) {
                    commit('SET_ACCOUNTING_DATE', savedDate)
                    dispatch('setStartBalance')
                        .finally(() => commit('APPEND_USER_ISLANDS'))
                    resolve(savedDate)
                } else {
                    Vue.axios.post('/api/get_accounting_date')
                        .then(res => {
                            commit('SET_ACCOUNTING_DATE', res.data.date)
                            dispatch('setStartBalance')
                                .finally(() => commit('APPEND_USER_ISLANDS'))
                            resolve(res)
                        })
                        .catch(e => reject(e))
                }
            })
        },
        changeAccountingDate ({commit, dispatch, getters, state}, date) {
            const loadSalaryPage = () => {
                if (anotherMonth) {
                    commit('ADD_TASK', 'salary')
                    dispatch('setMonthData')
                        .then(() => {
                            commit('REMOVE_TASK', 'salary')
                            dispatch('loadDailyPage')
                            dispatch('setUsers')
                            dispatch('setGroups')
                            dispatch('setCustomers')
                            dispatch('loadStockPage')
                            dispatch('setAppointments')
                        })
                } else {
                    dispatch('loadDailyPage')
                    dispatch('setUsers')
                    dispatch('setGroups')
                    dispatch('setCustomers')
                    dispatch('loadStockPage')
                    dispatch('setAppointments')
                }
            }
            const loadDailyPage = () => {
                commit('ADD_TASK', 'daily')
                dispatch('loadDailyPage')
                    .then(() => {
                        commit('REMOVE_TASK', 'daily')
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('setCustomers')
                        dispatch('loadStockPage')
                        dispatch('setAppointments')
                        if (anotherMonth) {
                            dispatch('setMonthData')
                        }
                    })
            }
            const loadStockPage = () => {
                commit('ADD_TASK', 'stock')
                dispatch('setReserves')
                    .then(() => dispatch('setStockActions')
                        .then(() => dispatch('setStockOptions')
                            .then(() => {
                                commit('REMOVE_TASK', 'stock')
                                dispatch('loadDailyPage')
                                dispatch('setUsers')
                                dispatch('setGroups')
                                dispatch('setCustomers')
                                dispatch('loadStockPage')
                                dispatch('setAppointments')
                                if (anotherMonth) {
                                    dispatch('setMonthData')
                                }
                            })
                        ))
            }
            const loadCustomersPage = () => {
                commit('ADD_TASK', 'customers')
                dispatch('setCustomers')
                    .then(() => {
                        commit('REMOVE_TASK', 'customers')
                        dispatch('loadDailyPage')
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('loadStockPage')
                        dispatch('setAppointments')
                        if (anotherMonth) {
                            dispatch('setMonthData')
                        }
                    })
            }
            const loadAdminPage = () => {
                commit('ADD_TASK', 'admin')
                dispatch('setUsers')
                    .then(() => dispatch('setGroups')
                        .then(() => {
                            commit('REMOVE_TASK', 'admin')
                            dispatch('loadDailyPage')
                            dispatch('loadStockPage')
                            dispatch('setAppointments')
                            if (anotherMonth) {
                                dispatch('setMonthData')
                            }
                        })
                    )
            }
            const loadAppointmentsPage = () => {
                commit('ADD_TASK', 'appointments')
                dispatch('setAppointments')
                    .then(() => {
                        commit('REMOVE_TASK', 'appointments')
                        commit('REMOVE_TASK', 'stock')
                        dispatch('loadDailyPage')
                        dispatch('setUsers')
                        dispatch('setGroups')
                        dispatch('setCustomers')
                        dispatch('loadStockPage')
                        if (anotherMonth) {
                            dispatch('setMonthData')
                        }
                    })
            }

            let anotherMonth = new Date(state.accountingDate).getMonth() !== new Date(date).getMonth()
            Cookies.set('accounting_date', date)
            commit('SET_ACCOUNTING_DATE', date)
            dispatch('priorPrepare')
                .then(() => {
                    switch (getters.currentPage) {
                        case 'daily': loadDailyPage()
                            break
                        case 'salary': loadSalaryPage()
                            break
                        case 'stock': loadStockPage()
                            break
                        case 'customers': loadCustomersPage()
                            break
                        case 'admin': loadAdminPage()
                            break
                        case 'appointments': loadAppointmentsPage()
                            break
                        default: dispatch('setUsers')
                            break
                    }
                })
                .finally(() => commit('APPEND_USER_ISLANDS'))
        }
    },
    mutations: {
        APPEND_USER_ISLANDS (state) {
            state.islands = state.islands.map(island => ({
                ...island,
                chief_id: island.chiefs && island.chiefs.length && island.chiefs
                    .sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0)
                    .find(chief => chief.date === state.accountingDate || chief.date < state.accountingDate).user_id || null
            }))
                .map(island => ({... island, chief: state.users.find(user => user.id === island.chief_id)}))
            state.users = state.users.map(user => ({...user, controlled_islands: state.islands.filter(island => island.chief_id === user.id)}))
        },
        UPDATE_ACCESS_REQUEST (state, accessRequest) {
            state.accessRequests = state.accessRequests.map(item => +item.id === +accessRequest.id ? accessRequest : item)
        },
        SET_DAILY_PAGE (state, data) {
            if (data.workdays) {
                state.workdays = data.workdays
            }
            if (data.deals) {
                state.deals = data.deals
            }
            state.expenses = data.expenses
            state.handover = data.handover
        },
        UPDATE_ISLAND (state, island) {
            state.islands = state.islands.map(item => +item.id === +island.id ? island : item)
        },
        UPDATE_WORKDAY (state, workday) {
            state.workdays = state.workdays.map(item => item.id === workday.id ? workday : item)
        },
        SET_LOADING_OFF (state) {
            state.loading --
        },
        SET_LOADING_ON (state) {
            state.loading ++
        },
        UPDATE_HAND_OVER (state, handover) {
            state.handover = handover.amount
        },
        ADD_HAND_OVER (state, handover) {
            state.handover = handover.amount
        },
        SET_HAND_OVER (state, data) {
            state.handover = data.amount
        },
        DELETE_DEAL (state, dealId) {
            state.deals = state.deals.filter(item => item.id !== dealId)
        },
        UPDATE_DEAL (state, deal) {
            state.deals = state.deals.map(item => item.id === deal.id ? deal : item)
        },
        DELETE_EXPENSE (state, expenseId) {
            state.expenses = state.expenses.filter(item => item.id !== expenseId)
        },
        ADD_EXPENSE (state, expense) {
            state.expenses.push(expense)
        },
        SET_EXPENSES (state, expenses) {
            state.expenses = expenses
        },
        SET_START_BALANCE (state, balance) {
            state.startBalance = balance
        },
        DELETE_CUSTOMER (state, customerId) {
            state.customers = state.customers.filter(item => item.id !== customerId)
        },
        ADD_DEAL (state, deal) {
            state.deals.push(deal)
        },
        SET_DEALS (state, deals) {
            state.deals = deals
        },
        SET_SCAN_MODE (state, mode) {
            state.scanMode = mode
        },
        SET_REAL_DATE (state, date) {
          state.realDate = new Date(date).toISOString().split('T')[0]
        },
        UPDATE_WORK_DAY (state, workday) {
            state.workdays = state.workdays.map(item => item.id === workday.id ? workday : item)
        },
        ADD_WORK_DAY (state, workday) {
            state.workdays.push(workday)
        },
        SET_WORK_DAYS (state, workdays) {
            state.workdays = workdays
        },
        SET_WORKING_ISLAND_ID (state, id) {
            state.workingIslandId = id
        },
        DELETE_ISLAND (state, islandId) {
            state.islands = state.islands.filter(island => island.id !== islandId)
        },
        UPDATE_CUSTOMER (state, customer) {
            state.customers = state.customers.map(item => +item.id === +customer.id ? customer : item)
        },
        ADD_CUSTOMER (state, customer) {
            state.customers.push(customer)
        },
        SET_CUSTOMERS (state, customers) {
            state.customers = customers
        },
        REMOVE_ACCESS_REQUEST (state, accessId) {
            state.accessRequests = state.accessRequests.filter(item => item.id !== accessId)
        },
        ADD_ISLAND(state, island) {
            state.islands.push(island)
        },
        SET_ISLANDS (state, islands) {
            state.islands = islands
        },
        SET_ACCESS_REQUESTS (state, accesses) {
            state.accessRequests = accesses
        },
        SET_DEVICE_ID (state, deviceId) {
            Cookies.set('isi-access', deviceId, { expires: 365 })
        },
        SET_ACCESS (state, access) {
            state.access = access
            state.workingIslandId = access.island_id || null
        },
        SET_BASE_PATH (state, path) {
            state.basePath = path
        },
        DELETE_GROUP (state, id) {
            state.groups = state.groups.filter(group => group.id !== id)
        },
        UPDATE_GROUP (state, group) {
            state.groups = state.groups.map(item => item.id === group.id ? group : item)
        },
        ADD_GROUP (state, group) {
            state.groups.push(group)
        },
        SET_GROUPS (state, groups) {
            state.groups = groups
        },
        DELETE_USER (state, id) {
            state.users = state.users.filter(user => user.id !== id)
        },
        UPDATE_USER (state, user) {
            state.users = state.users.map(item => item.id === user.id ? user : item)
        },
        ADD_USER (state, user) {
            state.users.push(user)
        },
        SET_USERS (state, users) {
            state.users = users
        },
        SET_ACCOUNTING_DATE (state, date) {
            state.accountingDate = date
        },
        SET_STATUS (state, status) {
            state.status = status
        },
        AUTH_LOGOUT (state) {
            const clearAllTimers = function(){
                let lastID = 0;
                return function(){
                    let currentID = setTimeout(function(){}, 1);
                    for(let id = currentID; id > lastID; id--){
                        clearTimeout(id);
                    }
                    lastID = currentID;
                };
            }();
            clearAllTimers()

            Cookies.remove('accounting_date')
            Cookies.remove('isi-token')
            Cookies.remove('saved-page')
            delete Vue.axios.defaults.headers.common['Authorization']
            state.authUser = null
            state.status = 'logout'
            Vue.axios.post('/api/details')
        },
        SET_AUTH_USER (state, user) {
            state.authUser = user
            state.status = 'success'
        }
    },
    getters: {
        logist: state => state.authUser && state.authUser.logist || false,
        usedLeadFilterSites: state => {
            let result = []
            state.islands.forEach(island => {
                if (island.options && island.options.sites && island.options.sites.length) {
                    island.options.sites.forEach(site => result.push(site))
                }
            })
            return result
        },
        currentDeals: state => state.deals,
        workingIslandId: state => state.workingIslandId,
        callCenter: (state, getters) => !getters.isSuperadmin && getters.workingIsland && getters.workingIsland.options && getters.workingIsland.options.callCenter || false,
        accountingDate: state => state.accountingDate,
        realDate: state => state.realDate,
        allIslands: state => state.islands,
        allUsers: state => state.users,
        currentVpbxExtension: (state, getters) => state.authUser && state.authUser.vpbx_extension
            || getters.workingIsland && getters.workingIsland.vpbx_extension || null,
        workingIsland: state => state.islands.find(item => item.id === state.workingIslandId),
        isToday: state => state.realDate === state.accountingDate,
        totalDealExpense: state => {
            const add = (a, b) => a + +b.expense
            return state.deals.reduce(add, 0)
        },
        totalDealIncome: state => {
            const add = (a, b) => a + +b.income
            return state.deals.reduce(add, 0)
        },
        isAuth: state => !!state.authUser,
        token: () => Cookies.get('isi-token') || null,
        isAllowed: state => !!state.authUser && (state.authUser.is_superadmin || state.access && state.access.status === 'allowed'),
        isSuperadmin: state => !!state.authUser && state.authUser.is_superadmin,
        isDayOpen: state => {
            let currentDate = new Date(state.realDate).toISOString().split('T')[0]
            let today = state.accountingDate === currentDate
            let usersWorkDay = state.workdays.find(item => item.user_id === state.authUser.id)
            return !!usersWorkDay && !!usersWorkDay.time_start && !usersWorkDay.time_finish && today
        },
        currentWorkDay: state => {
            return state.authUser && state.workdays.find(item => item.user_id === state.authUser.id)
        },
        isDayClosed: state => {
            let currentWorkDay =  state.authUser && state.workdays.find(item => item.user_id === state.authUser.id)
            return !!currentWorkDay && currentWorkDay.time_start && !!currentWorkDay && !!currentWorkDay.time_finish
        }
    }
})
