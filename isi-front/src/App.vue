<template>
  <v-app>
      <side-panel/>
      <app-toolbar v-if="authUser"/>
      <v-content>
          <messages-panel/>
          <call-reminder/>
          <query-inspector/>
          <app-menu v-if="authUser"/>
          <router-view
                  v-if="authUser || currentPage === 'login'"
          />
      </v-content>
  </v-app>
</template>

<script>
import CallReminder from './components/leads/CallReminder'
import QueryInspector from './components/QueryInspector'
import AppToolbar from './components/main/AppToolbar'
import AppMenu from './components/main/AppMenu'
import SidePanel from './components/main/SidePanel'
import MessagesPanel from './components/main/MessagesPanel'
import $ from 'jquery'
export default {
    name: 'App',
    data: () => ({
        timerId: null,
        userRates: null
    }),
    computed: {
        allUsers () {
            return this.$store.getters.allUsers
        },
        acceptedSites () {
            return this.$store.getters.acceptedSites
        },
        wsRequests () {
            return this.$store.state.ws.requests
        },
        hasWsRequests () {
            return this.wsRequests
                .filter(item => item.page === this.$store.getters.currentPage)
                .length > 0
        },
        colors () {
            return this.$store.state.catalog.colors
        },
        monthData () {
            return this.$store.state.salary.monthData
        },
        workingIsland () {
            return this.$store.getters.workingIsland
        },
        authAllowed () {
            return this.$store.getters.isAllowed || this.$store.getters.logist
        },
        activeCabinetId () {
            return this.$store.state.appointment.activeCabinetId
        },
        islands () {
            return this.$store.state.islands
        },
        appointments () {
            return this.$store.state.appointment.appointments
        },
        archiveCommentsOpenId () {
            return this.$store.state.appointment.archiveCommentsOpenId
        },
        commentsOpenEvent () {
            return this.$store.getters.commentsOpenEvent
        },
        currentPage () {
            return this.$store.getters.currentPage
        },
        waitingLeadsCount () {
            return this.$store.getters.waitingLeadsCount
        },
        access () {
            return this.$store.state.access
        },
        loading () {
            return this.$store.getters.busy || this.hasWsRequests
        },
        authUser () {
            return this.$store.state.authUser
        }
    },
    methods: {
        logOut () {
            this.$store.dispatch('logOut')
            this.$router.push('/login')
        },
        showLeadsOnTitle () {
            let backupTitle = document.title
            if (this.timerId) {
                clearTimeout(this.timerId)
            }
            document.title = 'Непринятые заявки ' + this.waitingLeadsCount
            this.timerId = setTimeout(() => {
                document.title = backupTitle
            }, 1000)
        }
    },
    mounted () {
        setInterval(() => {
            if (this.waitingLeadsCount) {
                this.showLeadsOnTitle()
            }
        }, 2000)
    },
    created () {
        $(window).blur(function() {
            setInterval(() => {
                if (this.waitingLeadsCount) {
                    this.showLeadsOnTitle()
                }
            }, 2000)
        });
        $(window).focus(function() {
            setInterval(() => {
                if (this.waitingLeadsCount) {
                    this.showLeadsOnTitle()
                }
            }, 2000)
        });
        const extData = frame => {
            this.$store.dispatch('handleFrame', frame)
        }
        this.$options.sockets.onmessage = (frame) => extData(frame)
    },
    watch: {
        monthData (val) {
            const getRates = () => {
                this.userRates = val.users.map(user => ({
                    name: user.full_name,
                    hour_rate: user.hour_rate,
                    sales_rate: user.sales_rate,
                    records_rate: user.records_rate
                }))
            }
            val.users.length ? getRates() : null
        },
        authAllowed (val) {
            val ? this.$connect() : this.$disconnect()
        },
        access (val) {
            let userIslandIds = this.authUser && this.authUser.islands.length && this.authUser.islands.map(item => item.id) || []
            if (val.status && val.status !== 'allowed' || !userIslandIds.includes(val.island_id) || !val) {
                this.$router.push({path: '/access', query: this.$route.query})
            }
        }
    },
    components: {
        CallReminder,
        QueryInspector,
        AppToolbar,
        AppMenu,
        SidePanel,
        MessagesPanel
    }
}
</script>
