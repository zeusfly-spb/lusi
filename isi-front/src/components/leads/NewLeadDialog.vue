<template>
    <v-flex>
        <v-dialog
            v-model="dialog"
            max-width="600px"
        >
            <template v-slot:activator="{ on }">
                <v-btn color="primary" flat dark class="mb-2"
                       :disabled="!workingIslandId"
                       @click="showModal"
                >
                    Добавить заявку
                </v-btn>
            </template>
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Новая заявка</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-if="dialog"
                                    autofocus
                                    v-model="phone"
                                    label="Телефон"
                                    data-vv-as="Номер телефона"
                                    data-vv-name="phone"
                                    :error-messages="errors.collect('phone')"
                                    v-validate="'required|digits:10'"
                                    mask="(###) ### - ####"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="name"
                                              label="Имя клиента"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="comment"
                                              label="Примечание"
                                ></v-text-field>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="darken-1" flat @click="dialog = false">Отмена</v-btn>
                        <v-btn color="green darken-1"
                               flat
                               @click="saveLead"
                        >
                            Добавить
                        </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'NewLeadDialog',
        data: () => ({
            dialog: false,
            phone: '',
            name: '',
            comment: ''
        }),
        computed: {
            workingIslandId () {
                return this.$store.state.workingIslandId
            }
        },
        methods: {
            pause () {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: false})
                setTimeout(() => this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: true}), 20000)
            },
            showModal () {
                this.dialog = true
            },
            saveLead () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('addLead', {
                            phone: this.phone,
                            name: this.name,
                            comment: this.comment,
                            site: `island_${this.workingIslandId}`
                        })
                            .then(() => {
                                this.dialog = false
                                this.$store.dispatch('pushMessage', {
                                    text: 'Добавлена новая заявка',
                                    color: 'green'
                                })
                            })
                    })
            }
        },
        watch: {
            dialog (val) {
                if (val) {
                    [this.phone, this.name, this.comment] = ['', '', '']
                }
            }
        }
    }
</script>
<style scoped>
    .round-corner{
        border-radius: 5px;
    }
</style>
