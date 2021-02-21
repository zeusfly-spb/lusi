export default {
    state: {
        customerEditing: false,
        customersChanged: false,
        messageTime: 3,
        messages: [],
        sidePanel: false,
        sidePanelMode: null
    },
    actions: {
        pushMessage ({commit}, message) {
            commit('PUSH_MESSAGE', message)
        },
        pullMessage ({state, commit}) {
            return new Promise((resolve, reject) => {
                try {
                    if (state.messages.length) {
                        let message = state.messages[state.messages.length - 1]
                        commit('PULL_MESSAGE')
                        resolve(message)
                    } else {
                        reject(null)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        }
    },
    mutations: {
        SET_CUSTOMER_EDITING (state, val) {
            state.customerEditing = val
        },
        SET_CUSTOMERS_CHANGED (state, val) {
            state.customersChanged = val
        },
        SET_SIDE_PANEL_STATUS (state, data) {
            state.sidePanel = data.status
            state.sidePanelMode = data.mode
        },
        PUSH_MESSAGE (state, message) {
            state.messages.push(message)
        },
        PULL_MESSAGE (state) {
            state.messages.pop()
        }
    }
}
