import Vue from 'vue'

export default {
    actions: {
        setIslandOption ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/set_island_option', {... data})
                    .then(res => {
                        commit('UPDATE_ISLAND', res.data)
                        dispatch('pushMessage', {text: 'Настройки островка изменены'})
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        },
        cabinetsReduced ({}, islandId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/island_cabinets_reduced', {
                    island_id: islandId
                })
                    .then(res => resolve(res.data))
                    .catch(e => reject(e))
            })
        },
        firstCabinetCreated ({}, islandId) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/island_first_cabinet', {
                    island_id: islandId
                })
                    .then(res => resolve(res.data))
                    .catch(e => reject(e))
            })
        },
        updateIslandChiefs ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_island_chiefs', {... data})
                    .then(res => {
                        commit('UPDATE_ISLAND', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('APPEND_USER_ISLANDS'))
            })
        },
        updateIsland ({dispatch, commit}, data) {
            const performPost = (result) => {
                let baseMessage = `В островке "${data.name}" `
                let firstMessage = baseMessage + 'добавлен первый кабинет, и все существующие записи назначены на него' + ` (${result.post.count})`
                let lastMessage = baseMessage + 'удален последний кабинет и все его записи получили статус "без кабинета"' + ` (${result.post.count})`
                let message = result.post.mode === 'first' ? firstMessage : result.post.mode === 'last' ? lastMessage : null
                if (message) {
                    setTimeout(() => {
                        dispatch('pushMessage', {
                            text: message,
                            color: 'blue'
                        })
                    }, 1000)
                }
            }
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_island', {...data})
                    .then(res => {
                        if (res.data.post) {
                            performPost(res.data)
                            let payload = {}
                            for (let key in res.data) {
                                if (key !== 'post') {
                                    payload[key] = res.data[key]
                                }
                            }
                            commit('UPDATE_ISLAND', payload)
                            resolve(res)
                        } else {
                            commit('UPDATE_ISLAND', res.data)
                            resolve(res)
                        }
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('APPEND_USER_ISLANDS'))
            })
        }
    }
}
