import Vue from 'vue'

export default {
    state: {
        phoneFilter: number => {
            String.prototype.replaceAt = function(index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
            return number.replaceAt(8, '*').replaceAt(9, '*').replaceAt(10, '*').replaceAt(11, '*')
        }
    },
    actions: {
        createSmsReport ({rootState}, data) {
            return new Promise((resolve, reject) => {
                Vue.axios.post('/api/create_sms_report', {
                    ... data,
                    user_id: rootState.authUser.id || 0,
                    island_id: rootState.workingIslandId || 0
                })
                    .then(res => resolve(res))
                    .catch(e => reject(e))
            })
        },
        sendSMS ({dispatch, getters, state, rootState}, data) {
            return new Promise((resolve, reject) => {
            Vue.axios.post('https://crmkin.ru/tel/api/vpbx/sms/send', {
                    base_type: 'isi',
                    user_id: rootState.authUser.id,
                    extension: getters.currentVpbxExtension,
                    phone: data.number,
                    text: data.text
                })
                .then(res => {
                    dispatch('pushMessage', {
                        text: `СМС отправлено на номер ${state.phoneFilter(data.number)}`
                    })
                    resolve(res)
                })
                .catch(e => reject(e))
                .finally(() => dispatch('createSmsReport', {
                    number: data.number,
                    text: data.text
                }))
            })
        }
    }
}
