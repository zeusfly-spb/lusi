<template>
    <v-flex>
        <v-btn
            flat
            :disabled="!canAdd"
            @click="activate"
            color="primary "
        >
            Добавить запись
        </v-btn>
        <v-dialog
            v-model="active"
            max-width="800px"
        >
            <v-card class="round-corner">
                <v-card-title
                    class="light-blue darken-3"
                    style="height: 3em; padding: 0 1em"
                >
                    <span class="title white--text">
                        {{ `${ {add: 'Добавить', edit: 'Редактировать'}[mode]}`}} запись
                    </span>
                    <v-spacer/>
                    <v-icon
                        class="clickable"
                        @click="deactivate"
                        color="white"
                        title="Закрыть"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <sub>Услуга</sub>
                                <v-select
                                    v-model="editedAppointment.service_id"
                                    :items="services"
                                    item-text="description"
                                    item-value="id"
                                    single-line
                                    data-vv-name="service"
                                    data-vv-as="Услуга"
                                    :readonly="singleService"
                                    :error-messages="errors.collect('service')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Дата</sub>
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
                                            :label="editedAppointment.date | moment('DD MMMM YYYY г.')"
                                            prepend-icon="event"
                                            readonly
                                            v-on="on"
                                        />
                                    </template>
                                    <v-date-picker
                                        v-model="editedAppointment.date" no-title scrollable
                                        @change="datePicked"
                                        locale="ru"
                                        first-day-of-week="1"
                                        :min="realDate"
                                    />
                                </v-menu>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Время</sub>
                                <v-menu
                                    v-model="timeMenu"
                                    :close-on-content-click="false"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                            style="width: 4em"
                                            v-on="on"
                                            v-model="editedAppointment.time"
                                            readonly
                                        />
                                    </template>
                                    <v-card>
                                        <v-card-title class="light-blue darken-3">
                                        <span class="subheading white--text" style="font-weight: bold">
                                            Время записи {{ editedAppointment.date | moment('DD MMM YYYY г.')}}
                                        </span>
                                        </v-card-title>
                                        <v-card-text>
                                            <v-time-picker v-model="editedAppointment.time" format="24hr"/>
                                        </v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                flat="flat"
                                                @click="editedAppointment.time = null; timeMenu = false"
                                            >
                                                Отмена
                                            </v-btn>
                                            <v-btn
                                                color="green darken-1"
                                                flat="flat"
                                                @click="timeMenu = false"
                                                :disabled="!editedAppointment.time"
                                            >
                                                Назначить
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-menu>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Исполнитель</sub>
                                <v-select
                                    v-model="editedAppointment.performer_id"
                                    :items="users"
                                    item-text="full_name"
                                    item-value="id"
                                    single-line
                                    data-vv-name="performer"
                                    data-vv-as="Исполнитель"
                                    :error-messages="errors.collect('performer')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Клиент</sub>
                                <v-text-field
                                    v-model="editedAppointment.client_name"
                                    label="Имя"
                                    data-vv-as="Имя клиента"
                                    data-vv-name="client_name"
                                    :error-messages="errors.collect('client_name')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Телефон</sub>
                                <v-text-field
                                    style="width: 10em"
                                    v-model="editedAppointment.client_phone"
                                    label="Номер телефона"
                                    data-vv-as="Номер телефона клиента"
                                    data-vv-name="client_phone"
                                    :error-messages="errors.collect('client_phone')"
                                    v-validate="'required|digits:10'"
                                    mask="(###) ### - ####"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="deactivate">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'AppointmentDialog',
        props: ['appointment'],
        data: () => ({
            timeMenu: false,
            menu: false,
            active: false,
            mode: null,
            editedAppointment: null
        }),
        computed: {
            realDate () {
                return this.$store.state.realDate
            },
            users () {
                return this.workingIsland && this.workingIsland.users || []
            },
            singleService () {
                return this.services.length === 1
            },
            blankAppointment () {
                return {
                    performer_id: null,
                    service_id: null,
                    lead_id: null,
                    island_id: this.$store.state.workingIslandId,
                    client_phone: null,
                    date: null,
                    time: null,
                    client_name: null,
                    comment: null
                }
            },
            authUser () {
                return this.$store.state.authUser
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            services () {
                return this.workingIsland && this.workingIsland.services || []
            },
            canAdd () {
                return this.workingIslandId && !this.active
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            }
        },
        methods: {
            datePicked (val) {
                this.editedAppointment.date = val
                this.menu = false
            },
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            }
        },
        created () {
            this.editedAppointment = this.appointment ? JSON.parse(JSON.stringify(this.appontment))
                : JSON.parse(JSON.stringify(this.blankAppointment))
        },
        watch: {
            active (val) {
                if (val) {
                    this.mode = this.appointment ? 'edit' : 'add'
                    if (this.mode === 'add') {
                        this.editedAppointment = JSON.parse(JSON.stringify(this.blankAppointment))
                    }
                    if (this.singleService) {
                        this.editedAppointment.service_id = this.services[0].id
                    }
                }
            },
            appointment (val) {
               if (val) {
                   this.editedAppointment = JSON.parse(JSON.stringify(val))
               } else {
                   this.editedAppointment = JSON.parse(JSON.stringify(this.blankAppointment))
               }
            }
        }
    }
</script>
