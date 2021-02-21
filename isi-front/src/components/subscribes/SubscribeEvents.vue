<template>
    <v-flex>
        <v-dialog
            v-model="active"
            max-width="1200px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="light-blue darken-3"
                >
                    <span
                        class="white--text title"
                    >
                        <v-icon
                            color="white"
                            class="pr-2"
                        >
                            event_note
                        </v-icon>
                        Записи абонента
                        <span
                            class="customer-name"
                        >
                            {{ $store.getters.truncate(customerName, 20) }}
                        </span>
                        по абонементу
                        <span
                            class="subscribe-name"
                        >
                            {{ $store.getters.truncate(subName, 19)  }}
                        </span> от
                        <span
                            class="start-date"
                        >
                            {{ startDate | moment('D MMMM YYYY г.') }}
                        </span>
                    </span>
                    <v-spacer/>
                    <v-icon
                        color="white"
                        class="clickable"
                        title="Закрыть"
                        @click="hideDialog"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-container
                        grid-list-md
                    >
                        <v-layout
                            wrap
                        >
                            <v-flex xs3 sm2 md1
                                v-blur="loading "
                                class="cell"
                                v-for="(item, index) in scale"
                                :key="index"
                            >
                                <v-icon
                                    v-if="!item"
                                    class="clickable"
                                    large
                                    color="grey lighten-2"
                                    title="Добавить запись по абонементу"
                                    @click="addModeOn"
                                >
                                    event
                                </v-icon>
                                <first-event
                                    compact
                                    v-if="item"
                                    :event="item"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
        <calendar-record-adder
            v-if="addMode"
            :preset-subscribe="subscribe"
            @reset="addModeOff"
        />
    </v-flex>
</template>

<script>
    import CalendarRecordAdder from '../appointments/CalendarRecordAdder'
    import FirstEvent from '../appointments/FirstEvent'
    export default {
        name: 'SubscribeEvents',
        data: () => ({
            addMode: false
        }),
        computed: {
            canAdd () {
                return this.events.length < this.nominal
            },
            loading () {
                return this.$store.state.subscribes.subscribesLoading
            },
            customerName () {
                return this.subscribe && this.subscribe.customer && this.subscribe.customer.full_name || ''
            },
            scale () {
                return this.subscribe && this.subscribe.scale || []
            },
            nominal () {
                return this.subscribe && this.subscribe.nominal || 0
            },
            subName () {
                return this.subscribe && this.subscribe.subscription &&this.subscribe.subscription.name || 'Абонемент'
            },
            startDate () {
                return this.subscribe && this.subscribe.start_date || ''
            },
            events () {
                const attachProperties = events => {
                    return events.map(event => ({
                        ... event,
                        user: this.$store.getters.allUsers.find(user => +user.id === +event.user_id) || {full_name: 'Неизвестный администратор'},
                        performer: this.$store.getters.allUsers.find(user => +user.id === +event.performer_id) || {full_name: 'Неизвестный исполнитель'},
                        service: this.$store.getters.workingIsland.services.find(service => +service.id === +event.service_id) || {description: 'Неизвестная услуга'},
                        island: this.$store.getters.allIslands.find(island => +island.id === +event.island_id) || {name: 'Неизвестный остров'}
                    }))
                }
                return this.subscribe && this.subscribe.events && attachProperties(this.subscribe.events) || []
            },
            subscribe () {
                return this.$store.getters.eventsOpenSubscribe
            },
            active: {
                get () {
                    return !!this.eventsOpenId
                },
                set (val) {
                    !val ? this.$store.commit('SET_SUBSCRIBE_EVENTS_OPEN_ID', null) : null
                }
            },
            eventsOpenId () {
                return this.$store.state.subscribes.eventsOpenId
            }
        },
        methods: {
            addModeOff () {
                this.addMode = false
            },
            addModeOn () {
                this.addMode = true
            },
            hideDialog () {
                this.active = false
            }
        },
        components: {
            CalendarRecordAdder,
            FirstEvent
        }
    }
</script>

<style scoped>
    .cell {
        display: flex;
        align-items: center;
        justify-content: center
    }
    .customer-name  {
        color: orange;
        font-weight: bolder;
    }
    .subscribe-name {
        color: yellow;
        font-weight: bold;
    }
    .start-date {
        color: orange;
        font-weight: bold;
        font-style: italic;
    }
</style>
