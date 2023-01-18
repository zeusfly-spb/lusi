<template>
    <div
        style="display: inline"
    >
        <v-btn
            icon
            title="Позвонить"
            class="p-0 m-0"
            :small="mini"
            :disabled="!currentVpxExtension"
            :color="flash ? 'white' : null"
            :large="flash && scalable"
            @click="makeCall"
        >
            <v-icon
                :small="mini"
                v-if="!mustBlink ? flash : true"
                :color="!!currentVpxExtension ? 'green' : 'grey'"
            >
                phone
            </v-icon>
        </v-btn>
        <v-dialog
            style="display: inline"
            v-model="codeSelector"
            max-width="700px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="title light-blue darken-3"
                >
                    <span
                        class="white--text"
                    >
                        Выберите трубку для совершения звонка
                    </span>
                    <v-spacer/>
                    <v-icon
                        color="white"
                        @click="codeSelector = false"
                        title="Отмена"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text
                    class="text-md-center"
                >
                    <v-btn
                        color="light-blue lighten-5"
                        @click="makeCodeCall(island.vpbx_extension)"
                    >
                        <v-icon
                            color="green"
                        >
                            phone
                        </v-icon>
                        <strong>{{ island && island.vpbx_extension }}</strong>
                    </v-btn>
                    <v-btn
                        v-for="item in additionalCodes"
                        :key="item.value"
                        @click="makeCodeCall(item.value)"
                    >
                        <v-icon
                            color="green"
                        >
                            phone
                        </v-icon>
                        {{ item.value }}
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    export default {
        name: 'Caller',
        props: {
            phone: {
                type: String,
                required: true
            },
            blinked: {
                type: Boolean,
                required: false,
                default: false
            },
            lead: {
                type: Object,
                required: false,
                default: null
            }
        },
        data: () => ({
            codeSelector: false,
            fab: false,
            selectedAdditionalCode: null,
            flash: false,
            timer: false,
            scalable: false,
            mustBlink: true
        }),
        computed: {
            additionalCodes () {
                const value = () => this.island.options.additionalTelephonyCodes || []
                return this.island && this.island.options && value() || []
            },
            island () {
                return this.$store.getters.workingIsland
            },
            mini () {
                return this.$store.getters.miniMode
            },
            authUser () {
                return this.$store.state.authUser
            },
            currentVpxExtension () {
                return this.$store.getters.currentVpbxExtension
            }
        },
        methods: {
            makeCodeCall (code) {
                this.codeSelector = false
                if (this.lead) {
                    this.$store.dispatch('addLeadCall', this.lead.id)
                }
                this.axios.post('https://crmkin.ru/tel/api/vpbx/call/make', {
                    user_id: this.authUser.id,
                    extension: code,
                    phone: this.phone[0] === '+' && this.phone[1] === '7' ? this.phone : '+7' + this.phone
                })
            },
            makeCall () {
                if (this.additionalCodes.length) {
                    this.codeSelector = true
                    return
                }
                if (this.lead) {
                    this.$store.dispatch('addLeadCall', this.lead.id)
                }
                this.axios.post('https://crmkin.ru/tel/api/vpbx/call/make', {
                    user_id: this.authUser.id,
                    extension: this.currentVpxExtension,
                    phone: this.phone[0] === '+' && this.phone[1] === '7' ? this.phone : '+7' + this.phone
                })
            }
        },
        mounted () {
            if (this.blinked) {
                this.timer = setInterval(() => {
                    this.flash = !this.flash
                }, 500)
            }
        },
        watch: {
            blinked (val) {
                if (val && !this.timer) {
                    this.timer = setInterval(() => {
                        this.flash = !this.flash
                    }, 500)
                } else {
                    if (!this.timer) clearInterval(this.timer)
                }
            }
        }
    }
</script>
