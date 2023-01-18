<template>
    <div>
        <v-alert
            :value="true"
            color="warning"
            v-if="(nowLeads.length || nowEvents.length) && !!authUser"
        >
            <div
                v-if="nowLeads.length"
            >
                <span class="title">Ожидают связи:</span>
                &nbsp;
                <span
                    v-for="(lead, index) in nowLeads"
                    :key="index"
                >
                <span
                    class="headline"
                >
                    {{ lead.name }}
                </span>
                <caller :phone="lead.phone" :lead="lead" blinked/>
            </span>
            </div>
            <div
                v-if="nowEvents.length"
            >
                <span class="title">Активные записи:</span>
                &nbsp;
                <v-chip
                    v-for="event in nowEvents"
                    :key="`evt-${event.id}`"
                    style="height: 40px"
                    class="orange--text"
                >
                    <span
                        class="headline"
                    >
                        {{ event.client_name }}
                    </span>
                    <v-btn
                        icon
                        title="Перейти в раздел 'Запись'"
                        :to="`/appointments?island=${event.island_id}`"
                    >
                        <v-icon
                            color="green"
                            class="ml-1 mr-1"
                        >
                            event
                        </v-icon>
                    </v-btn>
                    <span
                        class="blue--text headline"
                    >
                        {{ event.service.description }}
                    </span>
                    <caller
                        :phone="event.client_phone"
                        :lead="event.lead ? event.lead : null"
                        blinked
                    />
                </v-chip>
            </div>
        </v-alert>
    </div>
</template>
<script>
    import Caller from './Caller'
    export default {
        name: 'CallReminder',
        computed: {
            hideReminders () {
                return this.$store.getters.hideReminders
            },
            nowEvents () {
                if (this.hideReminders) {
                    return []
                }
                const limit = 0.01
                return this.todayEvents.filter(event => (new Date(event.date) - new Date()) / 6000 < limit)
            },
            todayEvents () {
                return this.$store.getters.todayEvents && this.$store.getters.todayEvents
                    .filter(event => event.status === 'active' && event.island_id === this.$store.state.workingIslandId) || []
            },
            authUser () {
                return this.$store.state.authUser
            },
            mustScroll () {
                return true
            },
            nowLeads () {
                if (this.hideReminders) {
                    return []
                }
                const limit = 0.01
                let base = this.todayLeads.length && this.todayLeads.filter(item => (new Date(item.last_postpone.date) - new Date()) / 60000 < limit)
                    .filter(item => item.status === 'process') || []
                return base.filter(item => !item.last_call || item.last_call && new Date(item.last_call.timestamp) < new Date(item.last_postpone.date))
            },
            postpones () {
                return this.$store.state.loader.postpones
            },
            todayLeads () {
                return this.$store.state.loader.callTodayLeads || []
            },
            active () {
                return true
            },
            leads () {
                return this.$store.state.loader.leads
            }
        },
        methods: {
            toTop () {
                this.$vuetify.goTo(0)
            }
        },
        watch: {
            nowLeads (val) {
                if (val && val.length && this.mustScroll) {
                    // this.toTop()
                }
            }
        },
        components: {
            Caller
        }
    }
</script>
