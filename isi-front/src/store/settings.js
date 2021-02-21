import Vue from 'vue'

export default {
    state: {
        hideReminders: null,
        mini: null,
        data: {
            switcherPanel: {
                maxAvaCount: 5,
                sortingParam: 'income',
                chiefFirst: false,
                reverseList: false
            },
            salaryPage: {
                visible: false,
                showPersonal: true,
                showOther: false,
                showTotal: false,
                showChief: false
            }
        }
    },
    actions: {
        updateSetting ({commit}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/update_setting', {...data})
                    .then(res => {
                        commit('SET_SETTING', res.data)
                        resolve(res)
                    })
                    .catch(e => reject(e))
            })
        }
    },
    mutations: {
        SET_HIDE_REMINDERS_VALUE (state, value) {
            state.hideReminders = value
            localStorage.setItem('isi-hideReminders', value)
        },
        SET_MINI_MODE_VALUE (state, value) {
            state.mini = value
            localStorage.setItem('isi-miniMode', value)
        },
        SET_SETTING (state, setting) {
            state.data = setting.data
        }
    },
    getters: {
        filterLeads: state => state.data.filterLeads || false,
        hideReminders: state => state.hideReminders !== null && state.hideReminders || localStorage.getItem('isi-hideReminders') === 'true' || false,
        miniMode: (state) => state.mini !== null && state.mini || localStorage.getItem('isi-miniMode') === 'true' || false
    }
}
