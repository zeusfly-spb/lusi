const Cookies = require('js-cookie')
import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'

const reverseLeadRelations = lead => ({
    ...lead,
    comments: lead.comments && lead.comments.reverse() || [],
    postpones: lead.postpones && lead.postpones.reverse() || []
})

export default {
    state: {
        callTodayLeads: [],
        showTodayPostpones: false,
        leadName: null,
        postpones: [],
        counts: null,
        leadStatus: 'wait',
        leads: [],
        beep: false,
        withDone: false,
        savedPage: null
    },
    actions: {
        refreshCallTodayLeads ({state, getters, commit}, lead) {
            try {
                if (getters.filterLeads && !getters.acceptedSites.includes(lead.site)) {
                    return
                }
                if (!getters.callTodayLeads.map(item => +item.id).includes(+lead.id)) {
                    return
                }
                let data = JSON.parse(JSON.stringify(getters.callTodayLeads))
                data = data
                    .map(item => +item.id === +lead.id ? lead : item)
                    .filter(item => item.last_postpone && item.last_postpone_date === getters.realDate)
                commit('SET_CALL_TODAY_LEADS', data)
            } catch (e) {
                return Promise.reject(new Error(`Refresh call today leads failed: ${e}`))
            }
        },
        startAnotherUserDay ({dispatch}, data) {
            try {
                let frame = {
                    type: 'request_start_workday',
                    model: {
                        island_id: data.island_id,
                        user_id: data.user_id
                    },
                    request: {
                        id: uuidv4(),
                        title: 'Начало рабочего дня',
                        page: 'daily'
                    }
                }
                dispatch('pushFrame', frame)
            } catch (e) {
                return Promise.reject(e)
            }
        },
        changeCount ({state, commit}, data) {
            let counts = state.counts
            if (!counts) {
                return
            }
            counts[data.status] += data.value
            commit('SET_COUNTS', counts)
        },
        setLeadsOnTimer ({commit, rootState, state, getters, dispatch}) {
            commit('SET_PAGINATOR_LOADING', true)
            dispatch('pushFrame', {
                type: 'request_get_leads',
                model: {
                    accepted_sites: getters.acceptedSites,
                    date: rootState.accountingDate,
                    with_done: state.withDone,
                    page: getters.paginator_page,
                    per_page: getters.paginator_per_page,
                    status: state.leadStatus,
                    name: state.leadName,
                    call_today: state.showTodayPostpones
                }
            })
        },
        setLeadName ({commit, dispatch, rootState}, name) {
            return new Promise((resolve, reject) => {
                commit('SET_SCAN_MODE', {...rootState.scanMode, leads: false})
                commit('SET_PAGINATOR_LOADING', true)
                commit('SET_LEAD_NAME', name)
                dispatch('setLeadsOnTimer')
                    .then(res => resolve(res))
                    .catch(e => reject(e))
                    .finally(() => {
                        commit('SET_PAGINATOR_LOADING', false)
                        commit('SET_SCAN_MODE', {...rootState.scanMode, leads: true})
                    })
            })
        },
        changeLeadStatus ({commit, dispatch}, status) {
            return new Promise ((resolve, reject) => {
                commit('SET_PAGINATOR_LOADING', true)
                commit('CHANGE_LEAD_STATUS', status)
                commit('RESET_PAGINATOR')
                dispatch('setLeadsOnTimer')
            })
        },
        loadStockPage ({commit, rootState, dispatch}) {
            /*
            commit('ADD_TASK', 'stock')
            dispatch('pushFrame', {
                type: 'request_load_stock_page',
                model: {
                    date: rootState.accountingDate,
                    island_id: rootState.workingIslandId
                }
            })
             */

            commit('ADD_TASK', 'stock')
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/load_stock_page', {
                    date: rootState.accountingDate,
                    island_id: rootState.workingIslandId
                })
                    .then(res => {
                        commit('SET_RESERVES', res.data.reserves)
                        commit('SET_STOCK_ACTIONS', res.data.stock_actions)
                        commit('SET_STOCK_OPTIONS', res.data.stock_options)
                        commit('REMOVE_TASK', 'stock')
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })


        },
        priorPrepare ({commit, dispatch}) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/prior_prepare')
                    .then(res => {
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
                        let savedDate = Cookies.get('accounting_date')
                        if (savedDate) {
                            commit('SET_ACCOUNTING_DATE', savedDate)
                            commit('SET_APPOINTMENT_DATE', savedDate)
                        } else {
                            commit('SET_APPOINTMENT_DATE', res.data.date)
                            commit('SET_ACCOUNTING_DATE', res.data.date)
                        }
                        dispatch('setStartBalance')
                        commit('SET_REAL_DATE', res.data.date)
                        if (res.data.setting) {
                            commit('SET_SETTING', res.data.setting)
                        }
                        commit('SET_ISLANDS', res.data.islands)
                        commit('APPEND_USER_ISLANDS')
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setSavedPage ({commit}) {
            let savedPage = Cookies.get('saved-page') || null
            commit('CHANGE_SAVED_PAGE', savedPage)
        },
        changeSavedPage ({commit}, page) {
            Cookies.set('saved-page', page)
            commit('CHANGE_SAVED_PAGE', page)
        },
        updateAccessIsland ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_access_island', {... data})
                    .then(res => {
                        commit('UPDATE_ACCESS_REQUEST', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateIslandUsers ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_island_users', {... data})
                    .then(res => {
                        commit('UPDATE_ISLAND', res.data.island)
                        if (res.data.users.length) {
                            res.data.users.forEach(item => commit('UPDATE_USER', item))
                        } else {
                            dispatch('setUsers')
                        }
                        resolve (res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateUserIslands ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_user_islands', {... data})
                    .then(res => {
                        commit('UPDATE_USER', res.data.user)
                        if (res.data.islands.length) {
                            res.data.islands.forEach(item => commit('UPDATE_ISLAND', item))
                        } else {
                            dispatch('setIslands')
                        }
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addLeadCall ({commit, rootState, dispatch}, leadId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_lead_call', {
                    user_id: rootState.authUser.id,
                    lead_id: leadId
                })
                    .then(res => {
                        let data = reverseLeadRelations(res.data)
                        // commit('UPDATE_LEAD', res.data)
                        dispatch('pushFrame', {
                            type: 'add_lead_call',
                            model: data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteCustomImage ({commit}, id) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_custom_image', {id: id})
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        uploadCustomImage ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/upload_custom_image', data)
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteCustomDoc ({commit}, id) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_custom_doc', {id: id})
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addCustomDoc ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_custom_doc', {... data})
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setDoneMode ({commit, dispatch, rootState}, doneMode) {
            commit('SET_DONE_MODE', doneMode)
            commit('SET_SCAN_MODE', {...rootState.scanMode, leads: false})
            if (doneMode) {
                dispatch('setLeads')
                    .then(() => commit('SET_SCAN_MODE', {...rootState.scanMode, leads: true}))
            } else {
                dispatch('setLeadsOnTimer')
                    .then(() => commit('SET_SCAN_MODE', {...rootState.scanMode, leads: true}))
            }
        },
        deleteLeadPostpone ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_lead_postpone', {... data})
                    .then(res => {
                        let data = reverseLeadRelations(res.data)
                        dispatch('pushFrame', {
                            type: 'delete_lead_postpone',
                            model: data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addLeadPostpone ({commit, rootState, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_lead_postpone', {
                    ... data,
                    user_id: rootState.authUser.id
                })
                    .then(res => {
                        let data = reverseLeadRelations(res.data)
                        dispatch('pushFrame', {
                            type: 'add_lead_postpone',
                            model: data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addLead ({commit, rootState, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_lead', {
                    ... data,
                    user_id: rootState.authUser.id
                })
                    .then(res => {
                        dispatch('pushFrame', {
                            type: 'add_lead',
                            model: res.data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteLeadComment ({commit, dispatch}, commentId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_lead_comment', {comment_id: commentId})
                    .then(res => {
                        let data = reverseLeadRelations(res.data)
                        dispatch('pushFrame', {
                            type: 'delete_lead_comment',
                            model: res.data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addLeadComment ({commit, rootState, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_lead_comment', {
                    ... data,
                    user_id: rootState.authUser.id
                })
                    .then(res => {
                        let data = reverseLeadRelations(res.data)
                        dispatch('pushFrame', {
                            type: 'add_lead_comment',
                            model: data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateLeadStatus ({commit, rootState, getters, dispatch}, data) {
            let before = getters.currentLeads.find(item => +item.id === +data.lead_id)
            let oldStatus = before && before.status || null
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_lead_status', {
                    ... data,
                    user_id: rootState.authUser.id
                })
                    .then(res => {
                        let data = reverseLeadRelations(res.data)
                        dispatch('pushFrame', {
                            type: 'change_lead_status',
                            model: {
                                ...data,
                                old_status: oldStatus
                            }
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteLead ({commit, dispatch}, leadId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_lead', {lead_id: leadId})
                    .then(res => {
                        dispatch('pushFrame', {
                            type: 'delete_lead',
                            model: res.data
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        setLeads ({commit, dispatch}) {
            commit('ADD_TASK', 'leads')
            dispatch('setLeadsOnTimer')
                .finally(() => commit('REMOVE_TASK', 'leads'))

        },
        updateIslandChiefId ({commit, rootState}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_chief_id', {... data, date: rootState.accountingDate})
                    .then(res => {
                        commit('UPDATE_ISLAND', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        deleteDocumentImage ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_image', {... data})
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateUserDate ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_user_date', {... data})
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        uploadDocumentImage ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/upload_image', data)
                    .then(res => {
                        commit('UPDATE_USER', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        loadDailyPage ({commit, rootState, dispatch}) {
            dispatch('pushFrame', {
                type: 'request_get_deals',
                model: {
                    date: rootState.accountingDate,
                    island_id: rootState.workingIslandId || null
                },
                request: {
                    id: uuidv4(),
                    title: 'Загрузка сделок текущей даты',
                    page: 'daily',
                    action: 'get_deals'
                }
            })
            dispatch('pushFrame', {
                type: 'request_get_workdays',
                model: {
                    date: rootState.accountingDate,
                    island_id: rootState.workingIslandId || null
                },
                request: {
                    id: uuidv4(),
                    title: 'Загрузка рабочих дней текущей даты',
                    page: 'daily'
                }
            })
            return new Promise((resolve, reject) => {
                commit('ADD_TASK', 'daily')
                Vue.axios.post('/api/load_daily_page', {
                    island_id: rootState.workingIslandId,
                    date: rootState.accountingDate
                })
                    .then(res => {
                        commit('SET_DAILY_PAGE', res.data)
                        commit('REMOVE_TASK', 'daily')
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        }
    },
    mutations: {
        UPDATE_LEAD_CUSTOMER (state, data) {
            let lead = state.leads.find(item => item.id === data.lead_id)
            if (lead.customer) {
                lead.customer.sent_messages = data.sent_messages
            }
            state.leads = state.leads.map(item => +item.id === +data.lead_id ? lead : item)
        },
        DECREASE_LEADS_COUNT (state, status) {
            state.counts[status]--
        },
        INCREASE_LEADS_COUNT (state, status) {
            state.counts[status]++
        },
        BEEP (state) {
            state.beep = true
            setTimeout(() => state.beep = false, 2000)
        },
        SET_CALL_TODAY_LEADS (state, leads) {
            state.callTodayLeads = leads.map(lead => reverseLeadRelations(lead))
        },
        SET_TODAY_POSTPONES (state, val) {
            state.showTodayPostpones = val
        },
        SET_LEAD_NAME (state, name) {
            state.leadName = name
        },
        SET_COUNTS (state, counts) {
            state.counts = counts
        },
        CHANGE_LEAD_STATUS (state, status) {
            state.leadStatus = status
        },
        CHANGE_SAVED_PAGE (state, page) {
            state.savedPage = page
        },
        SET_DONE_MODE (state, done) {
            state.withDone = done
        },
        ADD_LEAD (state, lead) {
            state.leads.push(lead)
        },
        UPDATE_LEAD (state, lead) {
            state.leads = state.leads.map(item => +item.id === +lead.id ? lead : item)
        },
        DELETE_LEAD (state, data) {
            state.leads = state.leads.filter(item => +item.id !== +data.id)
        },
        SET_LEADS (state, leads) {
            let prevCount = state.leads.filter(item => item.status === 'wait')
            state.leads = leads.map(lead => reverseLeadRelations(lead))
            let postCount = state.leads.filter(item => item.status === 'wait')
            if (postCount > prevCount) {
                state.beep = true
                setTimeout(() => state.beep = false, 2000)
            }
        }
    },
    getters: {
        showTodayPostpones: state => state.showTodayPostpones,
        acceptedSites: (state, getters) => {
            if (!getters.workingIsland || !getters.filterLeads) {
                return []
            }
            let sites = getters.workingIsland.options && getters.workingIsland.options.sites || []
            if (!sites.includes(`island_${getters.workingIsland.id}`)) {
                sites.push(`island_${getters.workingIsland.id}`)
            }
            return  sites
        },
        callTodayLeads: state => state.callTodayLeads,
        currentLeads: state => state.leads,
        currentLeadStatus: state => state.leadStatus,
        waitingLeadsCount: state => state.leads.filter(item => item.status === 'wait').length
    }
}
