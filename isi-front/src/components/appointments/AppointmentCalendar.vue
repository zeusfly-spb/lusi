<template>
    <v-flex>
        <v-layout
            class="ml-2 mr-2"
            align-center
        >
            <v-flex xs12 sm6 md4
                style="display: inline"
            >
                <v-layout>
                    <div>
                        <v-btn-toggle
                                v-show="viewMode === 'calendar'"
                                mandatory
                                v-model="mode"
                                class="ml-2 mt-2"
                                @change="changeMode"
                        >
                            <v-btn
                                    flat
                                    v-for="(icon, index) in icons"
                                    :key="index"
                                    color="blue-grey darken-2"
                                    :value="icon.mode"
                                    :title="icon.mode !== mode ? `Переключить на режим ${icon.caption}` : ''"
                            >
                                <v-icon
                                        large
                                        class="pl-0 pr-0"
                                >
                                    {{ icon.type }}
                                </v-icon>
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                    <v-switch
                            v-if="cabinets && cabinets.length && mode === 'day' && viewMode === 'calendar'"
                            v-model="tabMode"
                            class="m-0 p-0 ml-2"
                    >
                        <template v-slot:label>
                        <span
                                :class="{'tab-mode-label': tabMode}"
                        >
                           Режим вкладок
                        </span>
                        </template>
                    </v-switch>
                </v-layout>
            </v-flex>
            <v-flex
                class="text-sm-right"
            >
                <v-btn
                    icon
                    @click="goPrev"
                >
                    <v-icon>
                        keyboard_arrow_left
                    </v-icon>
                </v-btn>
            </v-flex>
            <v-flex
                class="text-xs-center"
                style="display: flex; justify-content: center; align-items: center"
            >
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
                    <span
                        v-on="on"
                        class="clickable title blue--text"
                        title="Изменить месяц"
                        v-if="['month', 'week'].includes(mode)"
                    >
                        {{ currentMonth | moment('MMMM YYYY') | upFirst }}
                    </span>
                        <span
                            v-on="on"
                            class="clickable title blue--text"
                            title="Изменить день"
                            v-else
                        >
                        {{ currentMonth | moment('D MMMM YYYY') | upFirst }}
                    </span>
                    </template>
                    <v-date-picker
                        :type="mode === 'month' ? 'month' : 'date'"
                        :value="currentMonth"
                        no-title
                        scrollable
                        @change="monthPicked"
                        locale="ru"
                        first-day-of-week="1"
                    />
                </v-menu>
            </v-flex>
            <v-flex
                class="text-sm-left"
            >
                <v-btn
                    icon
                    @click="goNext"
                >
                    <v-icon>
                        keyboard_arrow_right
                    </v-icon>
                </v-btn>
            </v-flex>
            <v-flex xs12 sm6 md4
                    class="text-sm-right"
            >
                <calendar-view-switcher
                    v-model="viewMode"
                />&nbsp;
            </v-flex>
        </v-layout>
        <v-layout
            v-if="tabMode && mode==='day' && viewMode === 'calendar'"
        >
            <cabinet-switcher/>
        </v-layout>
        <v-layout>
            <v-flex
                xs12
                class="mb-3 ml-1 mr-1"
            >
                <v-sheet
                    :height="windowHeight"
                    elevation="2"
                >
                    <v-calendar
                        v-show="viewMode === 'calendar'"
                        :type="mode"
                        locale="ru"
                        :weekdays="[1,2,3,4,5,6,0]"
                        ref="calendar"
                        v-model="currentMonth"
                        first-interval="8"
                        interval-count="15"
                        :interval-format="intervalFormat"
                        interval-height="48"
                        @click:date="selectDate"
                    >
                        <template v-slot:day="{ date, weekday }">
                            <v-flex
                                    style="width: 100%; height: 100%"
                                    :class="{'red lighten-5': [0, 6].includes(weekday)}"
                            >
                                <v-menu
                                        :value="date === openDate && workingIslandId"
                                        :close-on-content-click="false"
                                        :close-on-click="false"
                                        max-width="1000px"
                                >
                                    <template v-slot:activator="{ on }">
                                        <div v-on="on"></div>
                                    </template>
                                    <calendar-record-adder
                                            can-subscribe
                                            v-if="date === openDate && mode === 'month'"
                                            :date-prop="openDate"
                                            @reset="resetOpenDate"
                                            @message="forwardMessage"
                                    />
                                </v-menu>
                                <div style="width: 100%; height: 100%; cursor: pointer"
                                     @click="dayClick(date)"
                                     @touchend="dayClick(date)"
                                     :title="`Переключить на ${$moment(date).format('DD MMMM YYYY г.')} в режим 'день'`"
                                >
                                    <month-mode-date
                                            v-if="appointments.filter(item => item.date.split('T')[0] === date || item.date.split(' ')[0] === date).length"
                                            :date="date"
                                    />
                                </div>
                            </v-flex>
                        </template>
                        <template v-slot:dayLabel="{ day, weekday }">
                            <span
                                class="subheading"
                                :class="{'red--text': [0, 6].includes(weekday)}"
                            >
                                {{ day }}
                            </span>
                        </template>
                        <template v-slot:dayHeader="{ date, weekday }">
                            <v-flex
                                    style="width: 100%; height: 100%"
                            >
                                <calendar-record-adder
                                        can-subscribe
                                        v-if="date === openDate && ['week', 'day'].includes(mode)"
                                        :date-prop="openDate"
                                        @reset="resetOpenDate"
                                        @message="forwardMessage"
                                />
                                <cabinets-mode-header
                                        v-if="displayMode === 'cabinets'"
                                        :cabinets="cabinets"
                                />
                            </v-flex>
                        </template>
                        <template v-slot:interval="{ hour, date, weekday }">
                            <cabinets-mode-period
                                v-if="displayMode === 'cabinets' && !tabMode"
                                :cabinets="cabinets"
                                :hour="hour"
                                :date="date"
                                @delete="showDeleteConfirm"
                            />
                            <single-mode-period
                                v-if="displayMode === 'single' || displayMode === 'cabinets' && tabMode"
                                :cabinet-id="activeCabinetId"
                                :hour="hour"
                                :date="date"
                                @delete="showDeleteConfirm"
                            />
                            <week-mode-period
                                v-if="displayMode === 'week'"
                                :hour="hour"
                                :date="date"
                                :weekday="weekday"
                                @date="dayClick"
                            />
                        </template>
                    </v-calendar>
                    <events-archive
                        v-if="viewMode === 'archive'"
                    />
                    <subscribes-table
                        v-if="viewMode === 'subscriptions'"
                    />
                    <notification-table
                        v-if="viewMode === 'notifications'"
                    />
                    <certificates-table
                        v-if="viewMode === 'certificates'"
                    />
                </v-sheet>
            </v-flex>

        </v-layout>
        <v-dialog
            :value="!!eventToDelete"
            max-width="500px"
            v-if="eventToDelete"
            @update:returnValue="resetDeleting"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="red lighten-1">
                    <span class="title white--text">Подтверждение</span>
                </v-card-title>
                <v-card-text class="subheading">
                    Удалить запись <strong>{{ eventToDelete.service.description }}</strong>
                    островка <strong><em>{{ eventToDelete.island.name }}</em></strong> на
                    <strong>{{ eventToDelete.date | moment('DD MMMM YYYY г. в HH:mm')}}</strong>,
                    клиента <strong>{{ eventToDelete.client_name }}</strong>?
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn
                        flat
                        @click="resetDeleting"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="red darken-1"
                        flat
                        @click="deleteEvent"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <event-editor
            v-if="editedEvent"
            :event="editedEvent"
            @close="$store.commit('SET_EDITED_EVENT', null)"
        />
    </v-flex>
</template>
<script>
    import EventsArchive from './EventsArchive'
    import CalendarRecordAdder from './CalendarRecordAdder'
    import CabinetsModeHeader from './CabinetsModeHeader'
    import CabinetsModePeriod from './CabinetsModePeriod'
    import SingleModePeriod from './SingleModePeriod'
    import WeekModePeriod from './WeekModePeriod'
    import MonthModeDate from './MonthModeDate'
    import EventEditor from './EventEditor'
    import CalendarViewSwitcher from './CalendarViewSwitcher'
    import SubscribesTable from '../subscribes/SubscribesTable'
    import NotificationTable from './NotificationTable'
    import CabinetSwitcher from '../main/CabinetSwitcher'
    import CertificatesTable from '../certificates/CertificatesTable'

    export default {
        name: 'AppointmentCalendar',
        data: () => ({
            viewMode: null,
            mode: 'day',
            backupMode: null,
            currentMonth: null,
            newDate: null,
            menu: false,
            openDate: null,
            viewModes: [
                {name: 'month', description: 'Месяц'},
                {name: 'week', description: 'Неделя'},
                {name: 'day', description: 'День'}
            ],
            icons: [
                {caption: 'месяц', type: 'view_comfy', mode: 'month'},
                {caption: 'неделя', type: 'view_week', mode: 'week'},
                {caption: 'день', type: 'view_headline', mode: 'day'}
            ]
        }),
        computed: {
            activeCabinetId () {
                return this.$store.state.appointment.activeCabinetId || ''
            },
            tabMode: {
                get () {
                    return this.$store.state.appointment.tabMode
                },
                set (val) {
                    this.$store.dispatch('setTabMode', val)
                }
            },
            editedEvent () {
                return this.$store.state.appointment.editedEvent
            },
            breakpoint () {
                return this.$vuetify.breakpoint
            },
            eventToDelete () {
                return this.$store.state.appointment.eventToDelete
            },
            intervalHeight () {
                return this.$refs.calendar && this.$refs.calendar.intervalHeight
            },
            cabinets () {
                if (this.$store.getters.callCenter) {
                    return this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.cabinets
                }
                return this.workingIsland && this.workingIsland.cabinets
            },
            displayMode () {
                if (this.mode === 'day') {
                    if (this.$store.getters.callCenter) {
                        return !!this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.cabinets && this.$store.getters.inspectingIsland.cabinets.length ? 'cabinets' : 'single'
                    }
                    return !!this.workingIsland && this.workingIsland.cabinets && this.workingIsland.cabinets.length ? 'cabinets' : 'single'
                } else {
                    return this.mode
                }
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            appointments () {
                return this.$store.state.appointment.appointments
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            accountingDate () {
                return this.$store.state.accountingDate
            },
            windowHeight () {
                return window.innerHeight * .8
            }
        },
        methods: {
            changeMode (mode) {
                this.$store.dispatch('setAppointmentMode', mode)
            },
            resetDeleting () {
                this.$store.commit('CANCEL_DELETE_EVENT')
            },
            showDeleteConfirm (event) {
                this.eventToDelete = event
            },
            deleteEvent () {
                let text = `Запись ${this.eventToDelete.service.description} на ${this.$moment(this.eventToDelete.date).format('DD MMMM YYYY г. в HH:mm')},
                    клиента ${this.eventToDelete.client_name} удалена`
                this.$store.dispatch('deleteAppointment', this.eventToDelete)
                    .then(() => {
                        this.forwardMessage({text: text, color: 'green'})
                        this.resetDeleting()
                    })
            },
            dayClick (date) {
                this.currentMonth = date
                this.mode = 'day'
            },
            intervalFormat (interval) {
                return interval.time
            },
            forwardMessage (message) {
                this.$emit('message', {... message})
            },
            resetOpenDate () {
                this.openDate = null
            },
            selectDate (data) {
                /** Commented out to add a appointment retroactively
                 if (data.past) {
                    this.$emit('message', {text: 'Невозможно добавить запись на дату в прошлом!', color: 'red'})
                    return
                }
                 **/
                if (!this.workingIslandId) {
                    this.$emit('message', {text: 'Чтобы добавить запись, выберите островок', color: 'blue'})
                    return
                }
                this.currentMonth = data.date
                this.openDate = data.date
            },
            monthPicked (val) {
                let withDay = val.split('-').length > 2
                if (withDay) {
                    this.currentMonth = val
                } else {
                    this.currentMonth = `${val}-01`
                }
                this.menu = false
            },
            goNext () {
                this.resetOpenDate()
                this.$refs.calendar.next()
            },
            goPrev () {
                this.resetOpenDate()
                this.$refs.calendar.prev()
            }
        },
        created () {
            this.currentMonth = this.accountingDate
        },
        watch: {
            viewMode (val, oldVal) {
                if (oldVal === 'calendar' ) {
                    this.backupMode = this.mode
                }
                switch (val) {
                    case 'notifications':
                        this.mode = 'day'
                        break
                    case 'subscriptions':
                        this.mode = 'month'
                        break
                    case 'archive':
                        this.mode = 'month'
                        this.changeMode('month')
                        break
                }
                if (val === 'calendar' && !!oldVal) {
                    this.mode = this.backupMode
                    this.changeMode(this.backupMode)
                }
            },
            eventToDelete (event) {
                event ? this.$store.commit('DELETE_MODE_ON') : this.$store.commit('DELETE_MODE_OFF')
            },
            accountingDate (val, oldVal) {
                if (!oldVal) {
                    this.currentMonth = val
                }
            },
            currentMonth (val) {
                this.$store.dispatch('changeAppointmentDate', val)
            }
        },
        components: {
            CalendarRecordAdder,
            CabinetsModeHeader,
            CabinetsModePeriod,
            SingleModePeriod,
            WeekModePeriod,
            MonthModeDate,
            EventsArchive,
            EventEditor,
            CalendarViewSwitcher,
            SubscribesTable,
            NotificationTable,
            CabinetSwitcher,
            CertificatesTable
        }
    }
</script>
<style>
    @media (max-width: 600px) {
        .v-calendar-daily_head-day-label {
            font-size: 16px!important;
        }
    }
    @media (max-width: 960px) {
        .v-calendar-daily_head-day-label {
            font-size: 24px!important;
        }
    }
    .v-btn {
        padding: 0!important;
    }
    .tab-mode-label {
        font-weight: bold;
        color: green;
    }
</style>
