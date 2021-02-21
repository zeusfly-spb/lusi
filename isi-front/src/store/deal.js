import Vue from 'vue'
export default {
    actions: {
        updateDealPaymentType ({dispatch}, data) {
            dispatch('pushFrame', {
                type: 'request_update_deal_payment',
                model: {
                    deal_id: data.deal_id,
                    is_cache: data.is_cache
                }
            })
                .then(dispatch('pushMessage', {text: 'Форма оплаты сделки изменена'}))
        },
        updateDealServiceId ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_deal_service_id', {... data})
                    .then(res => {
                        dispatch('pushFrame', {
                            type: 'update_deal',
                            model: res.data
                        })
                            .then(() => dispatch('pushMessage', {text: 'Изменена услуга по сделке'}))
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        updateDealPrice ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_deal_price', {... data})
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
        updateDealCustomerId ({commit, rootState}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_deal_customer', {...data})
                    .then(res => {
                        commit('UPDATE_DEAL', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        }
    }
}
