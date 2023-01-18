import Vue from 'vue'

export default {
    state: {
        smsReportsLoading: false,
        smsReports: [],
        eventReminderOptions: [
            {value: null, title: 'Нет'},
            {value: 120, title: 'За два часа'},
            {value: 60, title: 'За час'}
        ]
    },
    actions: {
        setSmsReports ({commit, rootState, getters}) {
            return new Promise((resolve, reject) => {
                commit('SET_SMS_REPORTS_LOADING', true)
                Vue.axios.post('/api/get_sms_reports', {
                    date: getters.eventsDate,
                    island_id: rootState.workingIslandId
                })
                    .then(res => {
                        commit('SET_SMS_REPORTS', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
                    .finally(() => commit('SET_SMS_REPORTS_LOADING', false))
            })
        }
    },
    mutations: {
        SET_SMS_REPORTS_LOADING (state, val) {
            state.smsReportsLoading = val
        },
        SET_SMS_REPORTS (state, reports) {
            state.smsReports = reports
        }
    }
}
