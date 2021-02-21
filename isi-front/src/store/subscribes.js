import Vue from 'vue'

const attachRate = subscribe => {
    let completed = subscribe.events.filter(event => event.status === 'completed').length || 0
    let rate = completed === 0 ? 0 : (completed / subscribe.nominal) * 100
    return {... subscribe, rate: rate}
}

export default {
    state: {
        certUpdates: false,
        certCommentsOpenId: null,
        certificatesMode: 'active',
        certificates: [],
        inactiveSubscribes: [],
        allSubscribes: [],
        subscribeViewMode: null,
        commentsUpdating: false,
        commentsOpenId: null,
        eventsOpenId: null,
        subscribesLoading: false,
        subscribes: [],
        truncate: (text, stop, clamp) => {
            if (!text || !text.length) {
                return ''
            }
            return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
        }
    },
    actions: {
        deleteCertificateComment ({dispatch, commit}, data) {
            commit('SET_CERTIFICATES_UPDATES', true)
            dispatch('pushFrame', {
                type: 'request_delete_certificate_comment',
                model: {... data}
            })
        },
        addCertificateComment ({dispatch, commit}, data) {
            commit('SET_CERTIFICATES_UPDATES', true)
            dispatch('pushFrame', {
                type: 'request_add_certificate_comment',
                model: { ...data}
            })
        },
        setCertificateMode ({commit, dispatch}, mode) {
            commit('SET_CERTIFICATES_MODE', mode)
            dispatch('setCertificates')
        },
        setCertificates ({dispatch, getters, state, commit}) {
            const Frame = {
                type: 'request_get_certificates',
                model: {
                    island_id: getters.workingIslandId,
                    mode: state.certificatesMode
                }
            }
            commit('SET_CERTIFICATES_UPDATES', true)
            dispatch('pushFrame', Frame)
        },
        deleteSubscribeComment ({commit, dispatch}, data) {
            return new Promise((resolve, reject) => {
                commit('SET_DESCRIBE_COMMENTS_UPDATING', true)
                Vue.axios.post('/api/delete_subscribe_comment', {... data})
                    .then(res => {
                        commit('UPDATE_SUBSCRIBE', res.data)
                        dispatch('pushMessage', {
                            text: 'Комментарий абонемента удален',
                            color: 'green'
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('SET_DESCRIBE_COMMENTS_UPDATING', false))
            })
        },
        addSubscribeComment ({commit, dispatch, rootState}, data) {
            return new Promise((resolve, reject) => {
                commit('SET_DESCRIBE_COMMENTS_UPDATING', true)
                Vue.axios.post('/api/add_subscribe_comment', {
                    ... data,
                    user_id: rootState.authUser.id
                })
                    .then(res => {
                        commit('UPDATE_SUBSCRIBE', res.data)
                        dispatch('pushMessage', {
                            text: 'К абонементу добавлен комментарий',
                            color: 'green'
                        })
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('SET_DESCRIBE_COMMENTS_UPDATING', false))
            })
        },
        setSubscribes ({commit, rootState, getters, dispatch}) {
            commit('SET_SUBSCRIBES_LOADING', true)
            dispatch('pushFrame', {
                type: 'request_get_subscribes',
                model: {
                    island_id: getters.callCenter && getters.inspectingIsland.id || rootState.workingIslandId,
                    date: getters.eventsDate
                }
            })
        },
        setInactiveSubscribes ({commit, rootState, getters, dispatch}) {
            commit('SET_SUBSCRIBES_LOADING', true)
            dispatch('pushFrame', {
                type: 'request_get_inactive_subscribes',
                model: {
                    island_id: getters.callCenter && getters.inspectingIsland.id || rootState.workingIslandId,
                    date: getters.eventsDate
                }
            })
        },
        setAllSubscribes ({commit, rootState, getters, dispatch}) {
            commit('SET_SUBSCRIBES_LOADING', true)
            dispatch('pushFrame', {
                type: 'request_get_all_subscribes',
                model: {
                    island_id: getters.callCenter && getters.inspectingIsland.id || rootState.workingIslandId,
                    date: getters.eventsDate
                }
            })
        }
    },
    mutations: {
        ADD_CERTIFICATE (state, cert) {
            state.certificates.unshift(cert)
        },
        SET_CERTIFICATES_UPDATES (state, value) {
            state.certUpdates = value
        },
        UPDATE_CERTIFICATE (state, certificate) {
            state.certificates = state.certificates.map(item => +item.id === +certificate.id ? certificate : item)
        },
        SET_CERT_COMMENTS_OPEN_ID (state, id) {
            state.certCommentsOpenId = id
        },
        SET_CERTIFICATES_MODE (state, mode) {
            state.certificatesMode = mode
        },
        SET_CERTIFICATES (state, certificates) {
            state.certificates = certificates
        },
        SET_ALL_SUBSCRIBES (state, subscribes) {
            state.allSubscribes = subscribes.map(item => attachRate(item))
        },
        SET_INACTIVE_SUBSCRIBES (state, subscribes) {
            state.inactiveSubscribes = subscribes.map(item => attachRate(item))
        },
        SET_SUBSCRIBE_MODE (state, mode) {
            state.subscribeViewMode = mode
        },
        SET_SUBSCRIBE_EVENTS_OPEN_ID (state, val) {
            state.eventsOpenId = val
        },
        SET_DESCRIBE_COMMENTS_UPDATING (state, val) {
            state.commentsUpdating = val
        },
        UPDATE_SUBSCRIBE (state, subscribe) {
            state.subscribes = state.subscribes.map(item => +item.id === +subscribe.id ? subscribe : item)
        },
        SET_SUBSCRIBE_COMMENTS_OPEN_ID (state, subscribeId) {
            state.commentsOpenId = subscribeId
        },
        SET_SUBSCRIBES_LOADING (state, val) {
            state.subscribesLoading = val
        },
        SET_SUBSCRIBES (state, subscribes) {
            state.subscribes = subscribes.map(item => attachRate(item))
        }
    },
    getters: {
        allSubscribes: state => state.subscribes,
        truncate: state => state.truncate,
        eventsOpenSubscribe: state => {
            const attachScale = subscribe => {
                if (!subscribe) {
                    return subscribe
                }
                let scale = new Array(subscribe.nominal)
                subscribe.events.length ? subscribe.events.forEach((item, index) => {
                    scale[index] = item
                }) : null
                return {... subscribe, scale: scale}
            }
            let base = !state.eventsOpenId ? null
                : !state.subscribes.length ? null
                : state.subscribes.find(item => +item.id === +state.eventsOpenId)
            return attachScale(base)
        }
    }
}
