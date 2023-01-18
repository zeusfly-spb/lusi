import Vue from 'vue'
import {v4 as uuidv4} from "uuid";

export default {
    state: {
        reserves: [],
        stockActions: [],
        options: {}
    },
    actions: {
        deleteProduct ({commit, dispatch}, productId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/delete_product', {id: productId})
                    .then(res => {
                        commit('SET_STOCK_OPTIONS', res.data)
                        dispatch('setReserves')
                            .then(() => resolve(res))
                    })
                    .catch(e => reject(e))
            })
        },
        updateProduct ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_product', {...data})
                    .then(res => {
                        commit('UPDATE_PRODUCT', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        addGood ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_product', {...data})
                    .then(res => {
                        commit('SET_STOCK_OPTIONS', res.data)
                        dispatch('setReserves')
                            .then(() => resolve(res))
                    })
                    .catch(e => reject(e))
            })
        },
        setStockOptions ({commit}) {
            commit('SET_LOADING_ON')
            commit('ADD_TASK', 'stock')
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/get_stock_options')
                    .then(res => {
                        commit('SET_STOCK_OPTIONS', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => {
                        commit('REMOVE_TASK', 'stock')
                        commit('SET_LOADING_OFF')
                    })
            })
        },
        addStockAction ({commit, rootState}, data) {
            commit('SET_LOADING_ON')
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/add_stock_action', {
                    ... data,
                    island_id: rootState.workingIslandId,
                    user_id: rootState.authUser.id,
                })
                    .then(res => {
                        commit('ADD_STOCK_ACTION',  res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('SET_LOADING_OFF'))
            })
        },
        setStockActions ({commit, rootState, dispatch, getters}) {
            dispatch('pushFrame', {
                type: 'request_get_stock_actions',
                model: {
                    date: getters.accountingDate,
                    island_id: getters.workingIslandId
                },
                request: {
                    id: uuidv4(),
                    title: 'Загрузка операций по складу',
                    page: 'stock',
                    action: 'get_stock_actions'
                }
            })
        },
        setReserves ({commit, rootState}) {
            commit('SET_LOADING_ON')
            return new Promise ((resolve, reject) => {
                Vue.axios.post('/api/get_reserves', {
                    date: rootState.accountingDate,
                    island_id: rootState.workingIslandId
                })
                    .then(res => {
                        commit('SET_RESERVES', res.data)
                        commit('SET_LOADING_OFF')
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        }
    },
    mutations: {
        UPDATE_PRODUCT (state, product) {
            state.options.products = state.options.products.map(item => +item.id === +product.id ? product : item)
        },
        SET_STOCK_OPTIONS (state, options) {
            state.options = options
        },
        ADD_STOCK_ACTION (state, stockAction) {
            state.stockActions.push(stockAction)
        },
        SET_STOCK_ACTIONS (state, stockActions) {
            state.stockActions = stockActions
        },
        SET_RESERVES (state, reserves) {
            state.reserves = reserves
        }
    },
    getters: {
        currentReserves: (state, getters, rootState) => {
            let result = []
            if (rootState.workingIslandId) {
                state.reserves.forEach(item => {
                    let positionOperations = state.stockActions
                        .filter(action => +action.product_id === +item.product_id && +action.type_id === +item.type_id && +action.size_id === +item.size_id)
                    const add = (a, b) => b.type === 'receipt' ? +a + +b.count : +a - +b.count
                    let clone = JSON.parse(JSON.stringify(item))
                    clone.count += positionOperations.reduce(add, 0)
                    result.push(clone)
                })
            } else {
                state.reserves.forEach(item => {
                    let positionOperations = state.stockActions
                        .filter(action => action.product_id === item.product_id && action.type_id === item.type_id && action.size_id === item.size_id)
                    const add = (a, b) => b.type === 'receipt' ? +a + +b.count : +a - +b.count
                    let clone = JSON.parse(JSON.stringify(item))
                    let count = state.reserves
                        .filter(reserve => reserve.product_id === item.product_id && reserve.type_id === item.type_id && reserve.size_id === item.size_id)
                        .reduce((a, b) => a + b.count, 0)
                    clone.count = count + positionOperations.reduce(add, 0)
                    result.push(clone)
                })
            }

            return result
        }
    }
}
