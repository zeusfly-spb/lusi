<template>
    <v-flex xs12 sm12 md12>
        <v-card class="round-corner">
            <v-card-title class="light-blue darken-3"
                          style="height: 2em; margin: 0; padding: 0"
            >
                    <span class="subheading white--text"
                          style="margin: 0 1em"
                    >
                        Услуги
                    </span>
            </v-card-title>
            <v-card-text>
                <v-flex>
                    <v-btn
                        flat
                        color="primary"
                        @click="add"
                    >
                        Добавить услугу
                    </v-btn>
                </v-flex>
                <v-data-table
                    :items="services"
                    :headers="headers"
                    hide-actions
                >
                    <template v-slot:items="props">
                        <tr>
                            <td>{{ props.index + 1 }}</td>
                            <td>{{ props.item.description }}</td>
                            <td>{{ props.item.price }}</td>
                            <td
                                align="center"
                                class="colors-column"
                            >
                                <v-icon
                                    v-if="props.item.changeable_price"
                                    color="green darken-1"
                                >
                                    check
                                </v-icon>
                            </td>
                            <td align="right">
                                <service-color-picker
                                    :service="props.item"
                                />
                            </td>
                            <td align="right">
                                <v-icon
                                    small
                                    color="blue"
                                    class="clickable"
                                    title="Редактировать запись"
                                    @click="edit(props.item)"
                                >
                                    edit
                                </v-icon>
                                <v-icon
                                    small
                                    color="red"
                                    class="clickable"
                                    title="Удалить запись"
                                    @click="confirmDelete(props.item)"
                                >
                                    delete
                                </v-icon>
                            </td>
                        </tr>
                    </template>
                    <template v-slot:no-data>
                        <span class="red--text">Нет услуг</span>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    <v-dialog
        v-model="dialog"
        max-width="700px"
    >
        <v-card class="round-corner">
            <v-card-title class="light-blue darken-3">
                <span class="title white--text">
                    {{ {add: 'Добавить', edit: 'Редактировать'}[mode] }} услугу
                </span>
            </v-card-title>
            <v-card-text>
                <v-container grid-list-md>
                    <v-layout wrap>
                        <v-flex xs12 sm6 md4>
                            <v-text-field
                                v-model="editedService.description"
                                label="Наименование"
                                data-vv-as="Наименование"
                                data-vv-name="description"
                                :error-messages="errors.collect('description')"
                                v-validate="'required'"
                            />
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-text-field
                                v-model="editedService.price"
                                label="Цена"
                                data-vv-as="Цена"
                                data-vv-name="price"
                                :error-messages="errors.collect('price')"
                                v-validate="'numeric'"
                            />

                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <v-checkbox
                                v-model="editedService.changeable_price"
                                label="Изменяемая цена"
                            />
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn
                    flat
                    @click="setMode(null)"
                >
                    Отмена
                </v-btn>
                <v-btn
                    flat
                    color="primary darken-1"
                    @click="action"
                >
                    Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog
        v-model="confirm"
        max-width="400px"
    >
        <v-card class="round-corner">
            <v-card-title class="title light-blue darken-3">
                <span class="white--text">Подтверждение</span>
            </v-card-title>
            <v-card-text>
                <span class="title">Удалить сервис {{ serviceToDelete && serviceToDelete.description }}, с кодом {{ serviceToDelete && serviceToDelete.name }}?</span>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn
                    flat
                    @click="confirm = false"
                >
                    Отмена
                </v-btn>
                <v-btn
                    flat
                    color="red darken-3"
                    @click="deleteService"
                >
                    Удалить
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</v-flex>
</template>
<script>
    import ServiceColorPicker from './ServicesColorPicker'
    export default {
        name: 'ServicesCatalog',
        data: () => ({
            confirm: false,
            serviceToDelete: null,
            snackColor: 'green',
            snackText: '',
            snackbar: false,
            dialog: false,
            mode: null,
            headers: [
                {text: '#', value: null},
                {text: 'Услуга', value: 'description'},
                {text: 'Цена', value: 'price'},
                {text: 'Изменяемая цена', sortable: false, value: 'changeable_price'},
                {text: 'Подсветка', sortable: false, align: 'center', value: null},
                {text: 'Действия', sortable: false, align: 'right', value: null}
            ],
            blankService: {
                name: '',
                description: '',
                price: '',
                changeable_price: false
            },
            editedService: null
        }),
        computed: {
            services () {
                return this.$store.state.catalog.services
            }
        },
        methods: {
            deleteService () {
                if (!this.serviceToDelete) {
                    return
                }
                this.$store.dispatch('deleteService', this.serviceToDelete.id)
                    .then(() => {
                        this.confirm = false
                        let text = `Сервис ${this.serviceToDelete.description} с кодом ${this.serviceToDelete.name} удален`
                        this.$store.dispatch('pushMessage', {
                            text: text,
                            color: 'green'
                        })
                    })
            },
            confirmDelete (service) {
                this.serviceToDelete = service
                this.confirm = true
            },
            action () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        switch (this.mode) {
                            case 'add':
                                this.createService()
                                break
                            case 'edit':
                                this.updateService()
                                break
                            default: break
                        }
                    })
            },
            updateService () {
                this.$store.dispatch('updateService', {... this.editedService})
                    .then((res) => {
                        let text = `Сервис ${res.data.description} изменен`
                        this.$store.dispatch('pushMessage', {
                            text: text,
                            color: 'green'
                        })
                        this.setMode(null)
                    })
            },
            createService () {
                this.$store.dispatch('createService', {... this.editedService})
                    .then((res) => {
                        let text = `Сервис ${res.data.description} добавлен`
                        this.$store.dispatch('pushMessage', {
                            text: text,
                            color: 'green'
                        })
                        this.setMode(null)
                    })
            },
            edit (service) {
                this.editedService = service
                this.setMode('edit')
            },
            add () {
                this.setMode('add')
            },
            setMode (mode) {
                this.mode = mode
            }
        },
        created () {
            this.editedService = this.blankService
        },
        mounted () {
            this.$store.dispatch('setCatalogs')
        },
        watch: {
            mode (val) {
                if (val === 'add' || val === null) {
                    this.editedService = JSON.parse(JSON.stringify(this.blankService))
                }
                if (val === 'add') {
                    this.editedService.name = this.$store.state.appointment.uniqID('serv')
                }
                this.dialog = !!val
            }
        },
        components: {
            ServiceColorPicker
        }
    }
</script>
<style>
    .colors-column {
        width: 5em!important;
    }
</style>
