<template>
    <v-flex>
        <calendar-record-adder
            v-if="attemptToEvent"
            :lead="attemptToEvent"
            @reset="cancelAttempt"
        />
    </v-flex>
</template>
<script>
    import CalendarRecordAdder from '../appointments/CalendarRecordAdder'
    export default {
        name: 'LeadEventAdder',
        computed: {
            attemptToEvent () {
                return this.$store.state.lead.attemptToEvent
            }
        },
        methods: {
            cancelAttempt () {
                this.$store.commit('REMOVE_ATTEMPT_TO_EVENT')
            }
        },
        components: {
            CalendarRecordAdder
        }
    }
</script>
