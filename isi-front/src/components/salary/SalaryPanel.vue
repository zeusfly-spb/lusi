<template>
    <v-flex
        align-center
    >
        <island-switcher/>
        <v-layout v-if="dates && dates.length < 12">
            <v-data-table
                v-blur="loading"
                :loading="loading"
                :items="['', ...users]"
                :headers="headers"
                hide-actions
                class="elevation-1 no-hover"
            >
                <template v-slot:items="props">
                    <component
                        :is="props.index === 0 ? 'total-data-row' : 'user-row'"
                        :user="props.item"
                        :dates="dates"
                    />
                </template>
            </v-data-table>
        </v-layout>

        <div
            v-else
            style="width: 100%; overflow: hidden"
            id="long-list"
            onselect="return false"
            @mousedown="listMouseDown"
            @mouseup="listMouseUp"
            @mouseout="listMouseOut"
            @mousemove="listMouseMove"
        >
            <v-data-table
                v-blur="loading"
                :loading="loading"
                :items="['', ...users]"
                :headers="headers"
                hide-actions
                class="elevation-1"
            >
                <template v-slot:items="props">
                    <component
                        :is="props.index === 0 ? 'total-data-row' : 'user-row'"
                        :user="props.item"
                        :dates="dates"
                    />
                </template>
            </v-data-table>

        </div>


    </v-flex>
</template>
<script>
    import TotalDataRow from './TotalDataRow'
    import UserRow from './UserRow'
    import IslandSwitcher from '../IslandSwitcher'
    import MonthSparkline from "./MonthSparkline";

    export default {
        name: 'SalaryPanel',
        data: () => ({
            dragMode: false
        }),
        computed: {
            loading () {
                return this.$store.getters.busy || this.$store.getters.wsLoading
            },
            workingIslandId () {
                return +this.$store.state.workingIslandId
            },
            currentMonth () {
                return this.$store.state.accountingDate && this.$store.state.accountingDate.split('-').slice(0, 2).join('-') || null
            },
            headers () {
                let dates = this.dates && this.dates.map(item => ({
                    text: this.hDate(item),
                    value: item,
                    sortable: false,
                    align: 'center'
                })) || []
                return [{
                    text: '',
                    value: null,
                    sortable: false,
                    align: 'center',
                    width: '370px'
                }, ... dates]
            },
            dates () {
                let today = new Date(this.$store.state.realDate)
                let tomorrow = today.setDate(today.getDate() + 1)
                return this.monthData && this.monthData.dates.filter(item => new Date(item) < tomorrow)
            },
            users () {
                const setUserRates = (user) => {
                    user.hour_rate = this.$store.state.userRate({user: user, island_id: this.workingIslandId, month: this.currentMonth, rate: 'hours'})
                    user.sales_rate = this.$store.state.userRate({user: user, island_id: this.workingIslandId, month: this.currentMonth, rate: 'sales'})
                    user.chief_rate = this.$store.state.userRate({user: user, island_id: this.workingIslandId, month: this.currentMonth, rate: 'chief'})
                    user.records_rate = this.$store.state.userRate({user: user, island_id: this.workingIslandId, month: this.currentMonth, rate: 'records'})
                    user.services_rate = this.$store.state.userRate({user: user, island_id: this.workingIslandId, month: this.currentMonth, rate: 'services'})
                    return user
                }

                let base =  this.monthData && this.monthData.users || []
                const add = (a, b) => a + +b.income
                base = base.map(item => ({... item, totalIncome: item.monthDeals.reduce(add, 0)}))
                const sortByTotalIncome = (a, b) => {
                    return b.totalIncome - a.totalIncome
                }
                const adminUp = (a, b) => {
                    return a.is_admin && !b.is_admin ? -1 : !a.is_admin && b.is_admin ? 1 : 0
                }
                if (this.workingIslandId) {
                    base = base.map(user => setUserRates(user))
                }
                return base
                    .sort(sortByTotalIncome)
                    .sort(adminUp)
            },
            monthData () {
                const leaveSelected = (user) => {
                    user.monthDeals = user.monthDeals.filter(item => +item.island_id === +this.workingIslandId)
                    user.monthWorkdays = user.monthWorkdays.filter(item => +item.island_id === +this.workingIslandId)
                    return user
                }
                let base = JSON.parse(JSON.stringify(this.$store.state.salary.monthData))
                if (this.workingIslandId && base) {
                    base.users = base.users.map(item => leaveSelected(item))
                }
                return base
            }
        },
        methods: {
            listMouseOut () {
                if (!this.dragMode) {
                    document.body.style.cursor = 'default'
                }
            },
            listMouseMove () {
                if (!this.dragMode) {
                    document.body.style.cursor = 'default'
                }
            },
            listMouseUp () {
                this.dragMode = false
                document.body.style.cursor = 'default'
            },
            listMouseDown (e) {
                this.dragMode = true
                let centerX = document.body.clientWidth / 2
                document.body.style.cursor = e.clientX < centerX ? 'w-resize' : 'e-resize'
            },
            hDate (textDate) {
                return this.$moment(textDate).format('D MMM')
            }
        },
        watch: {
            dates (val) {
                this.bottomPanel = val.length > 10
            }
        },
        components: {
            UserRow,
            TotalDataRow,
            IslandSwitcher,
            MonthSparkline
        }
    }
</script>
<style scoped>
    tr:hover {
        background-color: transparent !important;
    }
    td:hover {
         background-color: transparent !important;
    }
    ::selection {
        background: transparent;
    }
    ::-moz-selection {
        background: transparent;
    }
</style>
