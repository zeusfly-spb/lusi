<template>
    <v-dialog
        persistent
        v-if="editedEvent"
        value="true"
        max-width="1000"
    >
        <v-card class="round-corner">
            <v-card-title class="light-blue darken-3">
                <span class="title white--text">
                    Редактирование записи
                </span>
                <v-spacer/>
                <v-icon
                    class="clickable"
                    color="white"
                    @click="close"
                    title="Отмена"
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
                                :disabled="!!subscribe"
                                v-model="editedEvent.service_id"
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
                            <v-menu
                                v-model="menu"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                lazy
                                transition="scale-transition"
                                offset-y
                                full-width
                                min-width="290px"
                            >
                                <template v-slot:activator="{ on }">
                                    <sub>Дата</sub>
                                    <v-text-field
                                        :label="date | moment('DD MMMM YYYY г.')"
                                        readonly
                                        prepend-inner-icon="event"
                                        v-on="on"
                                    />
                                </template>
                                <v-date-picker
                                    locale="ru"
                                    first-day-of-week="1"
                                    v-model="date" no-title scrollable
                                    :min="dateMin"
                                    :max="dateMax"
                                    @change="datePicked"

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
                                        v-on="on"
                                        v-model="time"
                                        readonly
                                        prepend-inner-icon="schedule"
                                        data-vv-name="time"
                                        data-vv-as="Время"
                                        :error-messages="errors.collect('time')"
                                        v-validate="'required'"
                                    />
                                </template>
                                <v-card>
                                    <v-card-title class="light-blue darken-3">
                                    <span class="subheading white--text" style="font-weight: bold">
                                        Время записи на {{ editedEvent.date | moment('DD MMM YYYY г.') }}
                                    </span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-time-picker
                                            min="08:00"
                                            max="22:59"
                                            v-model="time"
                                            format="24hr"
                                        />
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer/>
                                        <v-btn
                                            flat="flat"
                                            @click="time = null; timeMenu = false"
                                        >
                                            Отмена
                                        </v-btn>
                                        <v-btn
                                            color="green darken-1"
                                            flat="flat"
                                            @click="timeMenu = false"
                                            :disabled="!time"
                                        >
                                            Назначить
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-menu>
                        </v-flex>
                        <v-flex xs12 sm6 md4
                                v-if="cabinets.length"
                        >
                            <sub>Кабинет</sub>
                            <v-select
                                prepend-inner-icon="meeting_room"
                                v-model="editedEvent.cabinet_id"
                                :items="cabinets"
                                item-text="name"
                                item-value="id"
                                single-line
                                data-vv-name="cabinet"
                                data-vv-as="Кабинет"
                                :readonly="singleCabinet"
                                :error-messages="errors.collect('cabinet')"
                                v-validate="cabinets.length ? 'required' : null"
                            />
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <sub>Исполнитель</sub>
                            <v-select
                                v-model="editedEvent.performer_id"
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
                                :disabled="!!subscribe"
                                v-model="editedEvent.client_name"
                                label="Имя"
                                data-vv-as="Имя клиента"
                                data-vv-name="client_name"
                                :error-messages="errors.collect('client_name')"
                                v-validate="'required'"
                            />
                        </v-flex>
                        <v-flex xs12 sm6 md4>
                            <sub>Телефон</sub>
<!--                            <v-text-field-->
<!--                                :disabled="!!subscribe"-->
<!--                                v-model="editedEvent.client_phone"-->
<!--                                prepend-inner-icon="phone"-->
<!--                                data-vv-as="Номер телефона клиента"-->
<!--                                data-vv-name="client_phone"-->
<!--                                :error-messages="errors.collect('client_phone')"-->
<!--                                v-validate="'required|digits:10'"-->
<!--                                mask="(###) ### - ####"-->
<!--                            />-->
                          <div>
                            {{ editedEvent.client_phone | phone }}
                          </div>
                        </v-flex>
                    </v-layout>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer/>
                <v-btn
                    flat="flat"
                    @click="close"
                >
                    Отмена
                </v-btn>
                <v-btn
                    color="green darken-1"
                    flat="flat"
                    @click="updateEvent"
                    :disabled="!changed"
                >
                    Сохранить
                </v-btn>
            </v-card-actions>
        </v-card>

    </v-dialog>
</template>
<script>
    export default {
        name: 'EventEditor',
        props: ['event'],
        data: () => ({
            date: null,
            time: null,
            timeMenu: false,
            editedEvent: null,
            backupEvent: null,
            menu: false
        }),
        computed: {
            dateMax () {
                return this.subscribe ? this.subscribe.finish_date : null
            },
            dateMin () {
                return this.subscribe ? this.subscribe.start_date : null
            },
            subscribe () {
                return this.event.subscribe_id && this.$store.getters.allSubscribes.find(sub => +sub.id === +this.event.subscribe_id) || null
            },
            users () {
                if (this.$store.getters.callCenter) {
                    return this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.users || []
                }
                return this.workingIsland && this.workingIsland.users || []
            },
            singleService () {
                return this.services.length === 1
            },
            services () {
                if (this.$store.getters.callCenter) {
                    return this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.services || []
                }
                return this.workingIsland && this.workingIsland.services || []
            },
            singleCabinet () {
                return this.cabinets.length === 1
            },
            cabinets () {
                if (this.$store.getters.callCenter) {
                    return this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.cabinets || []
                }
                return this.workingIsland && this.workingIsland.cabinets || []
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            changed () {
                return JSON.stringify(this.editedEvent) !== JSON.stringify(this.backupEvent)
            }
        },
        methods: {
            updateEvent () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) {
                            return
                        }
                        this.$store.dispatch('updateAppointment', this.editedEvent)
                            .then(() => {
                                let editedToCompare = JSON.parse(JSON.stringify(this.editedEvent))
                                let backupToCompare = JSON.parse(JSON.stringify(this.backupEvent))
                                delete(editedToCompare.date)
                                delete (backupToCompare.date)
                                let text
                                if (JSON.stringify(editedToCompare) === JSON.stringify(backupToCompare)) {
                                    text = `Запись пересена на ${this.$moment(this.editedEvent.date).format('DD MMMM YYYY г. HH:mm')}`
                                } else {
                                    text = `Запись изменена`
                                }
                                this.$store.commit('SEND_EVENT_MESSAGE', {text: text, color: 'green'})
                                this.close()
                            })
                    })
            },
            datePicked () {
                this.menu = false
            },
            deliverClose (data) {
                if (!data) {
                    this.close()
                }
            },
            close () {
                this.$emit('close')
            }
        },
        watch: {
            time (val, oldVal) {
                if (!val || !this.editedEvent.date || !oldVal) {
                    return
                }
                this.editedEvent.date = this.editedEvent.date.split(' ')[0] + ` ${val}`
            },
            date (val) {
                if (!val) {
                    this.time = null
                    return
                }
                this.editedEvent.date = `${val} ${this.time}`
            }
        },
        mounted () {
            const timePart = date => {
                if (date.includes('T')) {
                    return date.split('T')[1]
                } else {
                    return date.split(' ')[1]
                }
            }
            this.editedEvent = JSON.parse(JSON.stringify(this.event))
            this.backupEvent = JSON.parse(JSON.stringify(this.event))
            this.date = this.event.date.includes('T') ? this.event.date.split('T')[0] : this.event.date.split(' ')[0]
            this.time = this.$store.state.appointment.displayTime(timePart(this.event.date))
        }
    }
</script>
