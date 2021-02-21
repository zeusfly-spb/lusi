<template>
    <v-layout
        ref="mainLayout"
        style="width: 100%"
    >
        <cabinet-entry
            v-for="cabinet in cabinets"
            :key="cabinet.id"
            :cabinet="cabinet"
            :events="cabinetEvents(cabinet.id)"
            :date="date"
            :hour="hour"
            :field-width="fieldWidth"
            :field-height="$parent.intervalHeight"
            @fieldClicked="fieldClicked"
            @addAttempt="addAttempt"
        />
        <calendar-record-adder
            v-if="addMode"
            :date-prop="date"
            :preset-cabinet="activeCabinet"
            :preset-hour="hour"
            @reset="resetAdding"
        />
    </v-layout>
</template>
<script>
    import CalendarRecordAdder from './CalendarRecordAdder'
    import CabinetEntry from './CabinetEntry'
    export default {
        name: 'CabinetsModePeriod',
        props: ['cabinets', 'hour', 'date'],
        data: () => ({
            fullWidth: null,
            addMode: false,
            activeCabinetId: null
        }),
        computed: {
            dialogLocked () {
                return this.$store.state.appointment.dialogLocked
            },
            fieldWidth () {
                return this.fullWidth / this.cabinets.length
            },
            breakpoint () {
                return this.$vuetify.breakpoint
            },
            textDate () {
                return this.$moment(this.date).format('DD MMMM YYYY г.')
            },
            names () {
                return this.cabinets.map(item => item.name)
            },
            appointments () {
                const extend = (base) => {
                    base.draggable = base.status !== 'completed'
                    return base
                }
                return this.$store.state.appointment.appointments
                    .map(item => extend(item))
            },
            periodAppointments () {
                const relevant = item => {
                    if (item.date.includes('T')) {
                        return item.date.split('T')[0] === this.date && +item.date.split('T')[1].split(':')[0] === +this.hour
                    } else {
                        return item.date.split(' ')[0] === this.date && +item.date.split(' ')[1].split(':')[0] === +this.hour
                    }
                }
                let base =  this.appointments && this.appointments
                    .filter(item => relevant(item)) || []
                return base.sort(this.$store.state.appointment.sortByDateTime)
            }
        },
        methods: {
            addAttempt (cabinet) {
                this.activeCabinet = cabinet
                this.addMode = true
            },
            resetAdding () {
                this.addMode = false
            },
            fieldClicked (cabinet) {
                if (this.dialogLocked) {
                    return
                }
                this.activeCabinet = cabinet
                this.addMode = true
            },
            cabinetEvents (id) {
                return this.periodAppointments.filter(event => event.cabinet_id === id)
            }
        },
        mounted () {
            this.fullWidth = this.$refs.mainLayout.offsetWidth
        },
        updated () {
            this.fullWidth = this.$refs.mainLayout.offsetWidth
        },
        components: {
            CabinetEntry,
            CalendarRecordAdder
        }
    }
</script>
