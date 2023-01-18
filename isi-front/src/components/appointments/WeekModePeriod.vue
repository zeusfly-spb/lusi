<template>
    <div
        class="week-mode-period"
        :class="{'red lighten-5': [0, 6].includes(weekday)}"
        style="border: lightgrey 1px solid!important;"
        @click="dayClick(date)"
        @touchend="dayClick(date)"
        :title="`Переключить на ${$moment(date).format('DD MMMM YYYY г.')} в режим 'день'`"
    >
        <div
            v-if="appointments.length"
            class="subheading text-md-center"
        >
            <v-icon
                    v-if="$vuetify.breakpoint.name === 'xs'"
                    small
            >
                event
            </v-icon>
            <span v-else>
                Записей:
            </span>
            <span class="title blue--text">{{ appointments.length }}</span>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'WeekModePeriod',
        props: ['date', 'hour', 'weekday'],
        computed: {
            single () {
                return this.cabinets.length === 0
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            cabinets () {
                if (this.$store.getters.callCenter) {
                    return this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.cabinets || []
                }
                return this.workingIsland && this.workingIsland.cabinets || []
            },
            appointments () {
                const relevantDate = event => {
                    if (event.date.includes('T')) {
                        return event.date && event.date.split('T')[0] === this.date || false
                    } else {
                        return event.date && event.date.split(' ')[0] === this.date || false
                    }
                }
                const relevantHour = event => {
                    if (event.date.includes('T')) {
                        return event.date && event.date.split('T')[1] && +event.date.split('T')[1].split(':')[0] === +this.hour || false
                    } else {
                        return event.date && event.date.split(' ')[1] && +event.date.split(' ')[1].split(':')[0] === +this.hour || false
                    }
                }
                const compareItem = item => relevantDate(item) && relevantHour(item)
                let base = this.$store.state.appointment.appointments
                    .filter(item => compareItem(item))
                if (this.single) {
                    return base.filter(item => item.cabinet_id === null)
                } else {
                    return base.filter(item => item.cabinet_id !== null)
                }
            }
        },
        methods: {
            dayClick (date) {
                this.$emit('date', date)
            }
        }
    }
</script>
<style>
    .week-mode-period {
        cursor: pointer;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%; height: 100%;
    }
</style>
