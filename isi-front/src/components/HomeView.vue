<template>
    <v-flex align-center row>
        <v-tabs
            fixed-tabs
            @change="loadContent"
            v-model="tabControl"
        >
            <v-tab
                v-for="(item, index) in tabs"
                :key="index"
            >
                <v-badge color="red"
                         v-if="index === 3 && waitingLeadsCount"
                >
                    <template v-slot:badge>
                        <span>{{ waitingLeadsCount }}</span>
                    </template>
                    {{ item }}
                </v-badge>
                <span v-else>{{ item }}</span>
            </v-tab>
            <v-tabs-items touchless>
                <v-tab-item
                    v-for="(item, index) in tabs"
                    :key="index"
                >
                    <daily-accounting v-if="index === 0"/>
                    <customer-panel v-if="index === 1"/>
                    <stock-panel v-if="index === 2"/>
                    <lead-panel v-if="index === 3"/>
                    <salary-panel v-if="index === 4"/>
                    <admin-panel v-if="index === 5"/>
                </v-tab-item>
            </v-tabs-items>
        </v-tabs>
        <audio
            :src="`${basePath}/beep.wav`" autoplay
            v-if="beep"
        />
    </v-flex>
</template>
<script>
    import AdminPanel from './admin/AdminPanel'
    import StockPanel from './stock/StockPanel'
    import CustomerPanel from './customers/CustomerPanel'
    import DailyAccounting from './daily/DailyAccounting'
    import SalaryPanel from './salary/SalaryPanel'
    import LeadPanel from './leads/LeadPanel'

    export default {
        name: 'HomeView',
        data: () => ({
            adminTabs: ['Учет на день', 'База клиентов', 'Склад', 'Заявки', 'Зарплата', 'Администрирование'],
            switchCount: 0,
            tabControl: 0
        }),
        computed: {
            savedPage () {
                return this.$store.state.loader.savedPage
            },
            access () {
                return this.$store.state.access
            },
            regularTabs () {
                let base =  ['Учет на день', 'База клиентов', 'Склад', 'Заявки']
                return this.salaryVisible ? [...base, 'Зарплата'] : base
            },
            salaryVisible () {
                return this.$store.state.settings.data.salaryPage.visible
            },
            beep () {
                return this.$store.state.loader.beep
            },
            basePath () {
                return this.$store.state.basePath
            },
            waitingLeadsCount () {
                return this.$store.getters.waitingLeadsCount
            },
            scanMode () {
                return this.$store.state.scanMode
            },
            tabs () {
                return this.isSuperadmin ? this.adminTabs : this.regularTabs
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            user () {
                return this.$store.state.authUser || null
            }
        },
        methods: {
            loadContent (index) {
                this.switchCount++
                this.$store.commit('SET_SCAN_MODE', {
                    workdays: false,
                    accesses: false,
                    deals: false,
                    expenses: false,
                    leads: true
                })
                switch (index) {
                    case 0: this.$store.commit('SET_SCAN_MODE', {...this.scanMode, workdays: true, expenses: true, deals: true})
                        this.$store.dispatch('setCurrentPage', 'daily')
                        this.$store.dispatch('changeSavedPage', 'daily')
                        break
                    case 1: this.$store.dispatch('setCustomers')
                        this.$store.dispatch('setCurrentPage', 'customers')
                        this.$store.dispatch('changeSavedPage', 'customers')
                        break
                    case 2: this.$store.dispatch('setCurrentPage', 'stock')
                        this.$store.dispatch('changeSavedPage', 'stock')
                        break
                    case 3: this.$store.dispatch('setCurrentPage', 'leads')
                        this.$store.dispatch('changeSavedPage', 'leads')
                        break
                    case 4: this.$store.dispatch('setCurrentPage', 'salary')
                        this.$store.dispatch('changeSavedPage', 'salary')
                        break
                    case 5: this.$store.dispatch('setCurrentPage', 'admin')
                        this.$store.dispatch('changeSavedPage', 'admin')
                        break
                }
            },
            restoreSavedPage () {
                if (this.savedPage === this.$store.state.spinner.currentPage) return
                this.tabControl = {daily: 0, customers: 1, stock: 2, leads: 3, salary: 4, admin: 5}[this.savedPage]
                this.$store.dispatch('setCurrentPage', this.savedPage)
            }
        },
        beforeCreate () {
            this.$store.dispatch('setSavedPage')
        },
        watch: {
            user (val) {
                if (val) {
                    this.restoreSavedPage()
                }
            },
            access (val) {
                let userIslandIds = this.user && this.user.islands.length && this.user.islands.map(item => item.id) || []
                if (val.status && val.status !== 'allowed' || !userIslandIds.includes(val.island_id) || !val) {
                    this.$router.push('/access')
                }
            }
        },
        components: {
            AdminPanel,
            StockPanel,
            CustomerPanel,
            DailyAccounting,
            SalaryPanel,
            LeadPanel
        }
    }
</script>
