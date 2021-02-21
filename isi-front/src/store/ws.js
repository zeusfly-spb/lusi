import Vue from 'vue'

const isJson = str => {
    try {
        JSON.parse(str)
    } catch (e) {
        return false
    }
    return true
}

export default {
    state: {
        activeClients: [],
        requests: [],
        wsOutbox: []
    },
    actions: {
        processResponse ({dispatch, commit, state}, response) {
            return new Promise((resolve, reject) => {
                try {
                    const handle = () => {
                        commit('REMOVE_REQUEST', response.id)
                    }
                    response.info ? dispatch('pushMessage', {text: response.info}) : null
                    const awaitingIds = state.requests.map(item => item.id)
                    response.id && awaitingIds.includes(response.id) ? handle() : null
                    resolve()
                } catch (e) {
                    reject(e)
                }
            })
        },
        handleFrame ({dispatch, getters, commit, rootState}, frame) {
            const validate = conditions => {
                const valid = rule => {
                    switch (rule.compare) {
                        case 'equal':
                            return rule.value ===  getters[rule.name]
                        case 'more':
                            return rule.value > getters[rule.name]
                        case 'less':
                            return rule.value < getters[rule.name]
                        case 'includes':
                            return Array.isArray(rule.value) && rule.value.includes(getters[rule.name])
                        default: return true
                    }
                }
                return conditions.every(item => valid(item))
            }
            const postMutation = mutation => {
                switch (mutation.name) {
                    case 'DELETE_DEAL':
                        dispatch('setStockActions')
                        break
                    case 'ADD_APPOINTMENT':
                        dispatch('setSubscribes')
                        dispatch('setLeadsOnTimer')
                        break
                    case 'SET_MONTH_DATA':
                        dispatch('appendSalaryCharges')
                        !rootState.workingIslandId ? commit('SET_STAT_DATA', mutation.data) : null
                        break
                    case 'SET_LEADS':
                        commit('SET_PAGINATOR_LOADING', false)
                        break
                    default:
                        ['SET_SUBSCRIBES', 'SET_INACTIVE_SUBSCRIBES', 'SET_ALL_SUBSCRIBES'].includes(mutation.name) ?
                            commit('SET_SUBSCRIBES_LOADING', false) : null
                }
            }
            const handleInstruction = model => {
                if (model.conditions && model.conditions.length && !validate(model.conditions)) {
                    return
                }
                if (model.mutations && model.mutations.length) {
                    model.mutations.forEach(item => {
                        commit(item.name, item.data)
                        postMutation(item)
                    })
                }
                model.info ? dispatch('pushMessage', {...model.info}) : null
            }
            const dealDate = deal => deal.created_at.includes('T') ? deal.created_at.split('T')[0] : deal.created_at.split(' ')[0]
            const displayed = lead => getters.currentLeads.map(item => +item.id).includes(lead.id)
            /**
             * Frame handlers
             */

            const insertLead = lead => {
                if (getters.filterLeads && !getters.acceptedSites.includes(lead.site)) {
                    return
                }
                dispatch('changeCount', {
                    status: lead.status,
                    value: 1
                })
                    .then(() => {
                        lead.status === 'wait' ? commit('BEEP') : null
                        lead.status === getters.currentLeadStatus ? commit('ADD_LEAD', lead) : null
                    })
            }
            const deleteLead = lead => {
                if (getters.filterLeads && !getters.acceptedSites.includes(lead.site)) {
                    return
                }
                dispatch('changeCount', {
                    status: lead.status,
                    value: -1
                })
                    .then(() => displayed(lead) ? commit('DELETE_LEAD', lead) : null)
            }
            const changeLeadStatus = lead => {
                if (getters.filterLeads && !getters.acceptedSites.includes(lead.site)) {
                    return
                }
                let oldStatus = lead.old_status
                delete lead.old_status
                commit('DECREASE_LEADS_COUNT', oldStatus)
                commit('INCREASE_LEADS_COUNT', lead.status)
                getters.currentLeadStatus === oldStatus && displayed(lead) ? commit('DELETE_LEAD', lead) : null
                getters.currentLeadStatus === lead.status ? commit('ADD_LEAD', lead) : null
            }
            const updateLead = lead => {
                if (getters.filterLeads && !getters.acceptedSites.includes(lead.site)) {
                    return
                }
                displayed(lead) ? commit('UPDATE_LEAD', lead) : null
            }

            const refreshCallToday = lead => {
                if (getters.filterLeads && !getters.acceptedSites.includes(lead.site)) {
                    return
                }
                if (!getters.callTodayLeads.map(item => +item.id).includes(+lead.id)) {
                    return
                }
                let data = JSON.parse(JSON.stringify(getters.callTodayLeads))
                data = data.map(item => +item.id === +lead.id ? lead : item)
                    .filter(item => item.last_postpone && item.last_postpone_date === getters.realDate)
                commit('SET_CALL_TODAY_LEADS', data)
            }

            const mustHandle = obj => {
                let result = true
                switch (obj.type.split('_')[1]) {
                    case 'deal':
                        getters.accountingDate !== dealDate(obj.model) ? result = false : null
                        getters.workingIslandId !== 0 && obj.model.island_id !== getters.workingIslandId ? result = false : null
                        break
                }
                return result
            }

            return new Promise((resolve, reject) => {
                try {
                    if (!isJson(frame.data)) {
                        return
                    }
                    let obj = JSON.parse(frame.data)
                    if (!mustHandle(obj)) {
                        return
                    }
                    switch (obj.type) {
                        case 'set_active_clients':
                            commit('SET_ACTIVE_CLIENTS', obj.model)
                            break
                        case 'instruction':
                            handleInstruction(obj.model)
                            break
                        case 'update_deal':
                            commit('UPDATE_DEAL', obj.model)
                            break
                        case 'add_lead':
                            insertLead(obj.model)
                            break
                        case 'delete_lead':
                            deleteLead(obj.model)
                            break
                        case 'change_lead_status':
                            changeLeadStatus(obj.model)
                            refreshCallToday(obj.model)
                            break
                        case 'add_lead_call':
                            updateLead(obj.model)
                            refreshCallToday(obj.model)
                            break
                        case 'add_lead_comment':
                            updateLead(obj.model)
                            refreshCallToday(obj.model)
                            break
                        case 'delete_lead_comment':
                            updateLead(obj.model)
                            refreshCallToday(obj.model)
                            break
                        case 'add_lead_postpone':
                            updateLead(obj.model)
                            refreshCallToday(obj.model)
                            break
                        case 'delete_lead_postpone':
                            updateLead(obj.model)
                            refreshCallToday(obj.model)
                            break
                        case 'add_workday':
                            commit('ADD_WORK_DAY', obj.model)
                            break;
                        default: break
                    }
                    if (obj.response) {
                        dispatch('processResponse', obj.response)
                    }
                    resolve(frame)
                } catch (e) {
                    reject(e)
                }
            })
        },
        popFrame ({state, commit}) {
            return new Promise((resolve, reject) => {
                try {
                    let lastFrame = state.wsOutbox[state.wsOutbox.length - 1]
                    commit('POP_WS_OUTBOX')
                    resolve(lastFrame)
                } catch (e) {
                    reject(e)
                }
            })
        },
        pushFrame ({commit}, frame) {
            if (frame.request) {
                commit('PUSH_REQUEST', frame.request)
            }
            commit('PUSH_WS_OUTBOX', frame)
        }
    },
    mutations: {
        SET_ACTIVE_CLIENTS (state, clients) {
            state.activeClients = clients
        },
        REMOVE_REQUEST (state, id) {
            state.requests = state.requests.filter(item => item.id !== id)
        },
        PUSH_REQUEST (state, request) {
            state.requests.push(request)
        },
        PUSH_WS_OUTBOX (state, data) {
            state.wsOutbox.push(data)
        },
        POP_WS_OUTBOX(state) {
            state.wsOutbox.pop()
        }
    },
    getters: {
        wsRequests: state => state.requests,
        wsLoading: (state, getters) => {
            const limit = getters.isSuperAdmin ? 0 : getters.currentPage === 'daily' ? 2 : 0
            return state.requests.filter(request => request.page === getters.currentPage).length > limit
        }
    }
}
