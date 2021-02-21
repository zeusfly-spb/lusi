<template>
    <v-dialog
        v-model="confirm"
        max-width="600"
    >
        <v-card class="round-corner">
            <v-card-title class="red darken-1">
                <span class="title white--text">Подтверждение</span>
            </v-card-title>
            <v-card-text>
                <span class="title">Удалить заявку с номера <span v-if="confirmText[0] !== '+'">{{ confirmText  | phone}}</span> <span v-else>{{ confirmText | externalPhone}}</span>?</span>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    flat="flat"
                    @click="confirm = false"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="red darken-1"
                    flat="flat"
                    @click="deleteLead"
                    :disabled="!buttonEnabled"
                >
                    Удалить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        name: 'LeadRemover',
        data: () => ({
            buttonEnabled: true
        }),
        computed: {
            confirmText () {
                return this.leadToDelete && this.leadToDelete.phone || ''
            },
            confirm: {
                get () {
                    return !!this.leadToDelete
                },
                set (val) {
                    if (!val) {
                        this.leadToDelete = null
                    }
                }
            },
            leadToDelete: {
                get () {
                    return this.$store.state.lead.leadToDelete
                },
                set (val) {
                    this.$store.commit('SET_LEAD_TO_DELETE', val)
                }
            }
        },
        methods: {
            pause () {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: false})
                setTimeout(() => this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: true}), 20000)
            },
            deleteLead () {
                this.buttonEnabled = false
                this.pause()
                this.$store.dispatch('deleteLead', this.leadToDelete.id)
                    .then(() => {
                        this.$store.dispatch('pushMessage', {
                            text: `Заявка с номера ${this.$options.filters.phone(this.leadToDelete.phone)} удалена`,
                            color: 'green'

                        })
                        this.leadToDelete = null
                    })
            }
        },
        watch: {
            confirm (val) {
                val ? this.buttonEnabled = true : null
            }
        }
    }
</script>
