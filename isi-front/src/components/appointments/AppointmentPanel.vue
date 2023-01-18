<template>
    <v-flex>
        <v-snackbar
            v-model="snackbar"
            auto-height
            top
            :timeout="3000"
            :color="snackColor"
        >
            <span>{{ snackText }}</span>
        </v-snackbar>
        <island-switcher/>
        <inspecting-island-switcher
            v-if="callCenter"
        />
        <appointment-calendar
            v-if="workingIslandId && workingIsland"
            :mode="currentViewMode"
            @message="showSnack"
            @mode="setViewMode"
        />
        <div v-else class="title orange--text text--darken-3 text-md-center mt-2">
            <strong>Для просмотра записей, выберите островок</strong>
        </div>
        <done-event-dialog/>
    </v-flex>
</template>
<script>
    import IslandSwitcher from '../IslandSwitcher'
    import AppointmentCalendar from './AppointmentCalendar'
    import InspectingIslandSwitcher from '../main/InspectingIslandSwitcher'
    import DoneEventDialog from './DoneEventDialog'
    export default {
        name: 'AppointmentPanel',
        data: () => ({
            // eventDoneDealId: null,
            currentViewMode: 'day',
            snackbar: false,
            snackText: '',
            snackColor: 'green',
            viewModes: [
                {name: 'month', description: 'Месяц'},
                {name: 'week', description: 'Неделя'},
                {name: 'day', description: 'День'}
            ]
        }),
        computed: {
            callCenter () {
                return this.$store.getters.callCenter
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            eventMessage () {
                return this.$store.state.appointment.message
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            }
        },
        methods: {
            setViewMode (mode) {
                this.currentViewMode = mode
            },
            showSnack ({color, text}) {
                this.snackColor = color
                this.snackText = text
                this.snackbar = true
            }
        },
        watch: {
            eventMessage (val) {
                if (val) {
                    this.showSnack({...val})
                }
            }
        },
        components: {
            IslandSwitcher,
            AppointmentCalendar,
            InspectingIslandSwitcher,
            DoneEventDialog
        }
    }
</script>
