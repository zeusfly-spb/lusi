<template>
    <v-tabs
        v-if="isSuperadmin || logistOnStock"
        fixed-tabs
        centered
        slider-color="green"
        height="70"
        hide-slider
    >
        <v-tab
            v-for="tab in tabs"
            :key="tab.id"
            @click="changeCurrentIslandId(tab.id)"
            @touchend="changeCurrentIslandId(tab.id)"
        >
            <v-card
                :class="{'blue lighten-3': tab.id === workingIslandId}"
                height="65"
            >
                <v-card-text style="padding: 10px!important;">
                    <v-avatar
                        size="30px"
                        v-for="user in sliceUsers(tab)"
                        :key="user.id"
                        style="margin-right: .1em; margin-left: .1em"
                    >
                        <img :src="`${basePath}${user.avatar ? user.avatar : '/img/default.jpg'}`"
                             alt="Фото"
                             :title="user.full_name"
                             v-if="user.avatar !== 'plus'"
                        />
                        <span
                            v-else
                            :title="hiddenUsers(tab).map(item => item.full_name).join(' ,')"
                        >
                            +{{ hiddenUsers(tab).length }}
                        </span>
                    </v-avatar>

                    <v-card-actions
                        class="m-0 p-0"
                        style="padding: 5px!important;"
                        :class="{'mt-2': (tab.users && !tab.users.length) && tab.id !== 0}"
                    >
                        <div class="text-center">
                            <span
                                :class="{'ml-5 mr-5': !tab.id}"
                            >
                                {{ tab.name }}
                            </span>
                        </div>
                    </v-card-actions>

                </v-card-text>
            </v-card>
        </v-tab>
    </v-tabs>
</template>
<script>
    export default {
        name: 'IslandSwitcher',
        computed: {
            logistOnStock () {
                return ['daily', 'stock'].includes(this.$store.getters.currentPage) && this.$store.getters.logist
            },
            monthData () {
                return this.$store.state.salary.monthData
            },
            reverseList () {
                return this.$store.state.settings.data.switcherPanel.reverseList
            },
            chiefFirst () {
                return this.$store.state.settings.data.switcherPanel.chiefFirst
            },
            sortingParam () {
                return this.$store.state.settings.data.switcherPanel.sortingParam
            },
            maxAvaCount () {
                return this.$store.state.settings.data.switcherPanel.maxAvaCount
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            basePath () {
                return this.$store.state.basePath
            },
            tabs () {
                return [{id: 0, name: 'Все', users: [{avatar: '/img/logo.png'}]}, ...this.islands]
            },
            islands () {
                let result = this.$store.state.islands
                const add = (a, b) => a + b.income
                const sumHours = (a, b) => a + +b.working_hours
                const getDate = (timestamp) => timestamp.split(' ')[0]
                let dates = {start: this.monthData && this.monthData.dates[0], end: this.monthData && this.monthData.dates[this.monthData.dates.length - 1]}
                const addCharges = ({user, island_id}) => {
                    let userRow = this.monthData && this.monthData.users && this.monthData.users.find(item => item.id === user.id) || null
                    let totalIncome = userRow && userRow.deals && userRow.deals
                        .filter(deal => deal.island_id === island_id && getDate(deal.created_at) >= dates.start && getDate(deal.created_at) <= dates.end)
                        .reduce(add, 0) || 0
                    let totalHours = userRow && userRow.workdays && userRow.workdays
                        .filter(workday => workday.island_id === island_id && getDate(workday.created_at) >= dates.start && getDate(workday.created_at) <= dates.end)
                        .reduce(sumHours, 0) || 0
                    return {...user, totalIncome: totalIncome, totalHours: totalHours}
                }
                const sortByIncome = (a, b) => {
                    let incomeA = a && a.totalIncome ? a.totalIncome : 0
                    let incomeB = b && b.totalIncome ? b.totalIncome : 0
                    return incomeB - incomeA
                }
                const sortByHours = (a, b) => {
                    let hoursA = a && a.totalHours || 0
                    let hoursB = b && b.totalHours || 0
                    return hoursB - hoursA
                }
                const sortByStanding = (a, b) => {
                    return a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : 0
                }
                const riseChief = (island) => {
                    const byChiefId = (a, b) => a.id === island.chief_id ? -1 : 1
                    island.users = island.users.sort(byChiefId)
                    return island
                }
                result =  result.map(island => ({...island, users: island.users.map(user => addCharges({user: user, island_id: island.id}))}))
                switch (this.sortingParam) {
                    case 'income': result = result.map(island => ({...island, users: island.users.sort(sortByIncome)}))
                        break
                    case 'hours': result = result.map(island => ({...island, users: island.users.sort(sortByHours)}))
                        break
                    case 'standing': result = result.map(island => ({...island, users: island.users.sort(sortByStanding)}))
                        break
                }
                if (this.reverseList) {
                    result = result.map(island => ({...island, users: island.users.reverse()}))
                }
                if (this.chiefFirst) {
                    result = result.map(island => riseChief(island))
                }
                return JSON.parse(JSON.stringify(result))
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        methods: {
            hiddenUsers (tab) {
                let hiddenCount = tab.users.length - this.maxAvaCount
                if (hiddenCount) {
                    return tab.users.slice(this.maxAvaCount, tab.users.length)
                }
                return []
            },
            sliceUsers (tab) {
                if (tab.users.length > this.maxAvaCount) {
                    return [... tab.users.slice(0, this.maxAvaCount), {avatar: 'plus'}]
                }
                return  tab.users
            },
            changeCurrentIslandId (id) {
                this.$store.dispatch('setWorkingIslandId', id)
                this.$router.replace({query: {... this.$route.query, island: id}})
            },
            switched (val) {
                let selectedIslandId = this.tabs[val].id
                if (selectedIslandId !== this.workingIslandId) {
                    this.$store.dispatch('setWorkingIslandId', selectedIslandId)
                    this.$router.replace({query: {... this.$route.query, island: selectedIslandId}})
                }
            }
        },
        watch: {
            workingIslandId (val, oldVal) {
                if (!oldVal && this.$store.getters.currentPage === 'appointments') {
                    this.$store.dispatch('setAppointmentMode', 'day')
                }
            }
        }
    }
</script>
