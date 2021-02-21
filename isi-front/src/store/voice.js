export default {
    state: {
        voiceOutbox: []
    },
    actions: {
        pushVoiceMessage ({commit}, message ) {
            commit('PUSH_VOICE_MESSAGE', message)
        },
        popVoiceMessage ({state, commit}) {
            return new Promise((resolve, reject) => {
                try {
                    let lastVoiceMessage = state.voiceOutbox[state.voiceOutbox.length - 1]
                    commit('POP_VOICE_MESSAGE')
                    resolve(lastVoiceMessage)
                } catch (e) {
                    reject(e)
                }
            })
        }
    },
    mutations: {
        PUSH_VOICE_MESSAGE (state, message) {
            state.voiceOutbox.push(message)
        },
        POP_VOICE_MESSAGE(state) {
            state.voiceOutbox.pop()
        }
    },
    getters: {

    }
}