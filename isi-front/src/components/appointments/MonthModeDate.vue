<template>
    <v-flex
        class="month-mode-date"
    >
        <div v-if="cabinets.length">
            <div class="text-md-center"
                 v-if="events.length && breakpoint.name !== 'xs'"
            >
                <span class="title">Записи:</span>
            </div>
            <v-layout v-for="(item, index) in cabinets.filter(cabinet => cabinet.events.length > 0)"
                      :key="`${index}${item.id}`"
            >
                <v-flex left>
                    <v-icon
                        v-if="breakpoint.name === 'xs'"
                        small
                    >
                        meeting_room
                    </v-icon>
                    <span
                        v-else
                        class="subheading"
                    >
                        {{ item.name }}
                    </span>
                </v-flex>
                <v-flex
                    right
                    class="text-md-right"
                >
                    <span class="title blue--text">{{ item.events.length }}</span>
                </v-flex>
            </v-layout>
        </div>
        <v-flex
            class="text-md-center"
            v-if="events.length && !cabinets.length"
        >
            <v-icon
                small
                v-if="breakpoint.name === 'xs'"
            >
                event
            </v-icon>
            <span
                v-else
            >
                Записей:
            </span>
            <span class="title blue--text">{{ events.length }}</span>
        </v-flex>
    </v-flex>
</template>
<script>
    export default {
        name: 'MonthModeDate',
        props: ['date'],
        computed: {
            breakpoint () {
                return this.$vuetify.breakpoint
            },
            events () {
                const relevantDate = event => {
                    if (event.date.includes('T')) {
                        return event.date.split('T')[0] === this.date
                    } else {
                        return event.date.split(' ')[0] === this.date
                    }
                }
                let base = this.$store.state.appointment.appointments
                    .filter(item => relevantDate(item))
                if (this.$store.getters.callCenter) {
                    if (this.$store.getters.inspectingIsland.cabinets.length) {
                        return base.filter(item => this.$store.getters.inspectingIsland.cabinets.map(cab => +cab.id).includes(+item.cabinet_id))
                    } else {
                        return base.filter(item => item.cabinet_id === null)
                    }
                }
                if (this.workingIsland && this.workingIsland.cabinets.length) {
                    return base.filter(item => this.workingIsland.cabinets.map(cab => cab.id).includes(item.cabinet_id))
                } else {
                    return base.filter(item => item.cabinet_id === null)
                }
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            cabinets () {
                let base = this.workingIsland && this.workingIsland.cabinets || []
                if (base.length) {
                    return base.map(cabinet => ({...cabinet, events: this.events.filter(event => event.cabinet_id === cabinet.id)}))
                } else {
                    return base
                }
            }
        }
    }
</script>
<style>
    .month-mode-date {
        width: 100%;
        height: 100%;
    }
</style>
