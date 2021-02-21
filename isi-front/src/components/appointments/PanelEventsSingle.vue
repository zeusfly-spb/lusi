<template>
    <v-sheet>
        <v-calendar
            v-if="workingIsland"
            locale="ru"
            type="day"
            first-interval="8"
            interval-count="15"
            v-model="addingDate"
            :interval-height="intervalHeight"
            :interval-format="intervalFormat"
        >
            <template v-slot:dayHeader="{ date, past, present, future }">
                <div>
                    <v-menu
                            :close-on-content-click="false"
                            lazy
                            transition="scale-transition"
                            offset-y
                            full-width
                            min-width="290px"
                            v-model="menu"
                    >
                        <template v-slot:activator="{ on }">
                            <span class="clickable"
                                  title="Изменить дату календаря"
                                  v-on="on"
                            >
                                    <div
                                          class="ml-1 clickable"
                                          :class="{
                                                    'green--text': present,
                                                    'grey--text': past,
                                                    'blue--text': future
                                                  }"
                                    >
                                        {{ date | moment('D MMMM YYYY г.') }}
                                    </div>
                            </span>
                        </template>
                        <v-date-picker v-model="addingDate" no-title scrollable
                                       @change="menu = false"
                                       locale="ru"
                                       first-day-of-week="1"
                        >
                        </v-date-picker>
                    </v-menu>
                    <v-select
                        label="Кабинет"
                        v-if="hasCabinets"
                        v-model="selectedCabinetId"
                        :items="cabinets"
                        item-text="name"
                        item-value="id"
                    />
                </div>
            </template>
            <template v-slot:interval="{ hour }">
                <v-flex
                    class="interval"
                    :class="{'effect': borderEffect && addingHour === hour}"
                    @click="intervalClick(hour)"
                >
                    <v-badge
                        right
                        overlap
                        v-if="hourEvents(hour).length > 1"
                    >
                        <template v-slot:badge>
                            <span>{{ hourEvents(hour).length }}</span>
                        </template>
                        <v-icon
                            large
                            color="green"
                        >
                            event
                        </v-icon>
                    </v-badge>
                    <v-icon
                        large
                        color="green"
                        v-if="hourEvents(hour).length === 1"
                    >
                        event
                    </v-icon>
                    <span
                        class="blue--text caption"
                        v-if="hourEvents(hour).length"
                    >
                        {{ eventNames(hourEvents(hour)) }}
                    </span>
                </v-flex>
            </template>
        </v-calendar>
        <v-flex
            v-else
            class="subheading orange--text text-md-center"
        >
            <strong>Выберите островок</strong>
        </v-flex>
        <calendar-record-adder
            free
            v-if="addingHour"
            :date-prop="addingDate"
            :preset-cabinet="currentCabinet"
            :preset-hour="addingHour"
            @reset="resetAdding"
        />
    </v-sheet>
</template>
<script>
    const clearDate = datetime => datetime.includes('T') ? datetime.split('T')[0] : datetime.split(' ')[0]
    const clearTime = datetime => datetime.includes('T') ? datetime.split('T')[1] : datetime.split(' ')[1]

    import CalendarRecordAdder from '../appointments/CalendarRecordAdder'
    export default {
        name: 'PanelEventsSingle',
        data: () => ({
            adding: false,
            selectedCabinetId: null,
            menu:false,
            timerId: null,
            borderEffect: false
        }),
        computed: {
            currentCabinet () {
                return this.hasCabinets && this.cabinets.find(item => item.id === this.selectedCabinetId) || null
            },
            hasCabinets () {
                return this.cabinets.length > 0
            },
            cabinets () {
                return this.workingIsland && this.workingIsland.cabinets || []
            },
            attemptToEvent () {
                return this.$store.state.lead.attemptToEvent
            },
            addingHour: {
                get () {
                    return this.$store.state.appointment.addingHour
                },
                set (val) {
                    this.$store.commit('SET_ADDING_HOUR', val)
                }
            },
            addingDate: {
                get () {
                    return this.$store.state.appointment.addingDate || this.$store.state.realDate
                },
                set (val) {
                    this.$store.dispatch('setAddingDate', val)
                }
            },
            events () {
                let base  = this.$store.getters.sidePanelEvents
                if (this.hasCabinets) {
                    base = base.filter(item => item.cabinet_id === this.selectedCabinetId)
                }
                return base
                    .filter(item => clearDate(item.date) === this.addingDate)
                    .map(item => ({...item, hour: clearTime(item.date).split(':')[0]}))
            },
            intervalHeight () {
                return this.windowHeight / 15
            },
            windowHeight () {
                return window.innerHeight * .85
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            }
        },
        methods: {
            resetAdding () {
                this.$store.commit('UNSET_ADDING_HOUR')
            },
            intervalClick (hour) {
                this.addingHour = hour
                this.adding = true
            },
            selectFirstCabinet () {
                if (!this.hasCabinets) {
                    return
                }
                this.selectedCabinetId = this.cabinets[0]['id']
            },
            datePicked (val) {
                this.$store.commit('SET_ADDING_DATE', val)
            },
            showHourBorder () {
                if (this.timerId) {
                    clearTimeout(this.timerId)
                }
                this.borderEffect = false
                this.timerId = setTimeout(() => {
                    this.borderEffect = true
                }, 500)
            },
            eventNames (events) {
                let base = events.map(item => item.client_name)
                return events.length === 1 ? base[0] : base.join(', ')
            },
            hourEvents (hour) {
                return this.events.filter(item => +clearTime(item.date).split(':')[0] === +hour)
            },
            intervalFormat (interval) {
                return interval.time
            }
        },
        mounted () {
            this.selectFirstCabinet()
            setInterval(() => {
                if (this.addingHour) {
                    this.showHourBorder()
                }
            }, 1000)
        },
        watch: {
            hasCabinets (val) {
                if (val) {
                    this.selectFirstCabinet()
                }
            },
            addingHour (val) {
                if (val) {
                    this.showHourBorder()
                }
            }
        },
        components: {
            CalendarRecordAdder
        }
    }
</script>
<style scoped>
    .effect {
        border: 3px solid green;
    }
    .interval {
        height: 100%!important;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
