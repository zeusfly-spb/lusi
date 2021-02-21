<template>
    <v-snackbar
            v-model="snackbar"
            auto-height
            top
            :timeout="messageTime * 1000"
            :color="snackColor"
    >
        <span>{{ snackText }}</span>
    </v-snackbar>
</template>
<script>
    export default {
        name: 'MessagesPanel',
        data: () => ({
            snackbar: false,
            snackText: '',
            snackColor: '',
            voices: [],
            synth: null,
            utterInstance: null
        }),
        computed: {
            voiceMessages () {
                return this.$store.state.voice.voiceOutbox
            },
            wsOutbox () {
                return this.$store.state.ws.wsOutbox
            },
            messageTime () {
                return this.$store.state.layout.messageTime
            },
            messages () {
                return this.$store.state.layout.messages
            }
        },
        methods: {
            showMessage () {
                this.$store.dispatch('pullMessage')
                    .then(res => {
                        [this.snackColor, this.snackText, this.snackbar] = [res.color || 'green', res.text, true]
                    })
            },
            speak (message) {
                try {
                    const utterInstance = new SpeechSynthesisUtterance(message)
                    let synth = window.speechSynthesis
                    let voices
                    setTimeout(() => {
                        voices = synth.getVoices()
                        console.log(synth)
                        console.log(voices)
                        utterInstance.voice = voices[27]
                        synth.speak(utterInstance)
                    }, 50)
                } catch (e) {
                    console.error(e)
                    throw e
                }
            }
        },
        watch: {
            voiceMessages: async function (val) {
                if (!val.length) {
                    return
                }
                try {
                    let message = await this.$store.dispatch('popVoiceMessage')
                    this.speak(message)
                } catch (e) {
                    return Promise.reject(e)
                }
            },
            wsOutbox: async function(val) {
                if (!val.length) {
                    return
                }
                try {
                    let frame = await this.$store.dispatch('popFrame')
                    this.$socket && this.$socket.readyState ? this.$socket.send(JSON.stringify(frame))
                        : setTimeout(() => this.$socket && this.$socket.readyState && this.$socket.send(JSON.stringify(frame)) || null, 100)
                } catch (e) {
                    return Promise.reject(e)
                }
            },
            messages (val) {
                val.length ? this.showMessage() : null
            }
        }
    }
</script>
