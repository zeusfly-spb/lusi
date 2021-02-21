<template>
    <v-flex>
        <v-dialog
            v-model="active"
            persistent
            max-width="600px"

        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="light-blue darken-3" >
                    <span class="title white--text">Новый клиент</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.last_name"
                                    label="Фамилия"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.first_name"
                                    label="Имя"
                                    data-vv-as="Имя"
                                    data-vv-name="first-name"
                                    :error-messages="errors.collect('first-name')"
                                    v-validate="'required'"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.patronymic"
                                    label="Отчество"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-menu
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    min-width="290px"
                                    v-model="menu"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                            :label="editedCustomer.birth_date | moment('DD MMMM YYYY г.')"
                                            prepend-icon="event"
                                            readonly
                                            v-on="on"
                                        />
                                    </template>
                                    <v-date-picker
                                        v-model="date"
                                        no-title
                                        scrollable
                                        @change="datePicked"
                                    />
                                </v-menu>
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.address"
                                    label="Адрес"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.phone"
                                    label="Телефон"
                                    data-vv-as="Номер телефона"
                                    data-vv-name="phone"
                                    :error-messages="errors.collect('phone')"
                                    v-validate="'required|digits:10'"
                                    mask="(###) ### - ####"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.email"
                                    label="Электронная почта"
                                    data-vv-as="Адрес электронной почты"
                                    data-vv-name="email"
                                    :error-messages="errors.collect('email')"
                                    v-validate="'email'"
                                />
                            </v-flex>

                        </v-layout>
                    </v-container>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="$emit('cancel')">Закрыть</v-btn>
                    <v-btn color="green darken-1" flat @click="submitForm">Сохранить</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'NewCustomerDialog',
        props: ['active'],
        data: () => ({
            date: '',
            menu: false,
            editedCustomer: null,
            defaultCustomer: {
                first_name: '',
                last_name: '',
                patronymic: '',
                address: '',
                birth_date: '',
                phone: '',
                email: ''
            },
        }),
        methods: {
            submitForm () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('addCustomer', this.editedCustomer)
                            .then(res => {
                                this.$emit('added', res.data)
                            })
                    })
            },
            datePicked (date) {
                this.editedCustomer.birth_date = new Date(date).toISOString().split('T')[0]
                this.menu = false
            }
        },
        watch: {
            active (val) {
                if (val) {
                    this.editedCustomer = JSON.parse(JSON.stringify(this.defaultCustomer))
                }
            }
        },
        created () {
            this.editedCustomer = JSON.parse(JSON.stringify(this.defaultCustomer))
        }
    }
</script>
<style scoped>
    .round-corner {
        border-radius: 5px;
    }
</style>

