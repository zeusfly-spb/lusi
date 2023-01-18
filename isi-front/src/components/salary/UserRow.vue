<template>
    <tr v-show="visible">
        <td
            style="border: 1px solid black; padding: 0"
            v-show="workingIslandId"
            align="right"
        >
            <v-card
                flat
                style="width: 30em"
            >
                <v-card-title
                    class="pb-0"
                >
                    <v-avatar
                        size="36px"
                        class="align-center"
                    >
                        <img :src="basePath + user.avatar" alt="Фото" v-if="user.avatar">
                        <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else>
                    </v-avatar>
                    <div class="pl-2">
                        <strong>{{ user.full_name }}</strong>
                    </div>
                    <v-icon
                            v-if="user.is_admin"
                            class="pl-2"
                            color="red lighten-4"
                            title="Администратор"
                    >
                        star
                    </v-icon>
                </v-card-title>
                <v-card-text class="p-0 pt-0">
                    <table>
                        <tr>
                            <td class="info-tab">
                                Наименование
                            </td>
                            <td class="info-tab">
                                Всего
                            </td>
                            <td class="info-tab">
                                Коэф.
                            </td>
                            <td class="info-tab">
                                Итог
                            </td>
                        </tr>
                        <tr>
                            <td class="info-tab">
                                Часы
                            </td>
                            <td class="info-tab">
                                <strong>{{ +totalHours.toFixed(2) | pretty }}</strong>
                            </td>
                            <td class="info-tab">
                                <month-rate-editor
                                    :user="user"
                                    type="hours"
                                    v-if="isSuperadmin && workingIslandId"
                                />
                                <strong v-else>{{ user.hour_rate }}</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +hourRateAmount.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                        <tr v-if="user.is_admin && salaryOptions.adminDealsIncome || !user.is_admin && salaryOptions.specDealsIncome">
                            <td class="info-tab">
                                Оборот
                            </td>
                            <td class="info-tab">
                                <strong >{{ +totalIncome.toFixed(2) | pretty }}</strong>
                            </td>
                            <td class="info-tab">
                                <month-rate-editor
                                    :user="user"
                                    type="sales"
                                    v-if="isSuperadmin && workingIslandId"
                                />
                                <strong v-else>{{ user.sales_rate }}</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +salesRateAmount.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                        <tr v-if="user.is_admin && salaryOptions.adminSalesIncomeCount || !user.is_admin && salaryOptions.specSalesIncomeCount">
                            <td class="info-tab">
                                Оборот с продаж
                            </td>
                            <td class="info-tab">
                                <strong >{{ +salesIncome.toFixed(2) | pretty }}</strong>
                            </td>
                            <td class="info-tab">
                                <month-rate-editor
                                        :user="user"
                                        type="sales"
                                        v-if="isSuperadmin && workingIslandId"
                                />
                                <strong v-else>{{ user.sales_rate }}</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +salesIncomeAmount.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                        <tr v-if="user.is_admin && salaryOptions.adminServicesIncomeCount || !user.is_admin && salaryOptions.specServicesIncomeCount">
                            <td class="info-tab">
                                Оборот с услуг
                            </td>
                            <td class="info-tab">
                                <strong >{{ +servicesIncome.toFixed(2) | pretty }}</strong>
                            </td>
                            <td
                                class="info-tab"
                            >
                                <month-rate-editor
                                        :user="user"
                                        type="services"
                                        v-if="isSuperadmin && workingIslandId"
                                />
                                <strong v-else>{{ user.services_rate }}</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +servicesIncomeAmount.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                        <tr
                            v-if="user.is_admin && salaryOptions.adminAppointmentsCount || !user.is_admin && salaryOptions.specAppointmentsCount"
                        >
                            <td
                                class="info-tab"
                            >
                                Записи
                            </td>
                            <td
                                class="info-tab"
                            >
                                <strong>{{ user.app_count }}</strong>
                            </td>
                            <td
                                class="info-tab"
                            >
                                <month-rate-editor
                                        :user="user"
                                        type="records"
                                        v-if="isSuperadmin && workingIslandId"
                                />
                                <strong v-else>{{ user.records_rate }}</strong>
                            </td>
                            <td
                                class="info-tab"
                            >
                                <strong>{{ +recordsRateAmount.toFixed(2) | pretty }}</strong>
                            </td>

                        </tr>
                        <tr
                            v-if="isChief && showChiefInfo"
                            class="light-blue lighten-4"
                        >
                            <td class="info-tab">
                                Руководящий оборот
                            </td>
                            <td class="info-tab">
                                <strong >{{ +subDealsAmount.toFixed(2) | pretty }}</strong>
                            </td>
                            <td class="info-tab">
                                <month-rate-editor
                                    :user="user"
                                    type="chief"
                                    v-if="isSuperadmin && workingIslandId"
                                />
                                <strong v-else>{{ user.chief_rate }}</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +subDealsTotal.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>

                        <tr>
                            <td class="info-tab">
                                Премия
                            </td>
                            <td class="info-tab"></td>
                            <td class="info-tab"></td>
                            <td class="info-tab">
                                <user-prizes :user="user" @update="calculateTotals" ref="prizes"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="info-tab">
                                Штраф
                            </td>
                            <td class="info-tab"></td>
                            <td class="info-tab"></td>
                            <td class="info-tab">
                                <user-forfeits :user="user" @update="calculateTotals" ref="forfeits"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="info-tab">
                                Больничный
                            </td>
                            <td class="info-tab"></td>
                            <td class="info-tab"></td>
                            <td class="info-tab">
                                <user-sicks :user="user" @update="calculateTotals" ref="sicks"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="info-tab">
                                Отпускные
                            </td>
                            <td class="info-tab"></td>
                            <td class="info-tab"></td>
                            <td class="info-tab">
                                <user-vacations :user="user" @update="calculateTotals" ref="vacations"/>
                            </td>
                        </tr>
                       <tr>
                            <td class="total-tab"
                                colspan="3"
                            >
                                <strong>ИТОГО</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +grandTotal.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td class="total-tab"
                                colspan="3"
                            >
                                <strong>Выплаты</strong>
                            </td>
                            <td class="info-tab">
                                <user-prepays :user="user" @update="calculateTotals" ref="prepays"/>
                            </td>
                        </tr>
                        <tr>
                            <td class="total-tab"
                                colspan="3"
                            >
                                <strong>Остаток</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +(grandTotal - totalPrepays).toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td class="total-tab"
                                colspan="3"
                            >
                                <strong>Выдано</strong>
                            </td>
                            <td class="info-tab">
                                <strong>{{ +totalPrepays.toFixed(2) | pretty }}</strong>
                            </td>
                        </tr>
                    </table>
                </v-card-text>

            </v-card>
        </td>
        <user-total-field
            v-show="!workingIslandId"
            :user="user"
        />
        <td v-for="(date, index) in dates" :key="'main' + index"
            style="border: 1px solid black; padding: 0"
            width="5em"
            class="day-field"
            :class="{'red lighten-5': isHoliday(date)}"
            :title="`${user.full_name} за ${hDate(date)}`"
        >
            <v-list dense
                    :class="{'red lighten-5': isHoliday(date)}"
                    v-if="+getHours(date) || unmarkedDate(date)"
            >
                <v-list-tile :class="{'red white--text': unmarkedDate(date)}">
                    <v-list-tile-content>Часы:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ getHours(date) }}</v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>Сделки:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ getDealCount(date) }}</v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>Оборот:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ +getDealsIncome(date).toFixed(2) | pretty }}</v-list-tile-content>
                </v-list-tile>
                <v-list-tile>
                    <v-list-tile-content>Расход:</v-list-tile-content>
                    <v-list-tile-content class="align-end">{{ getDealsExpense(date) }}</v-list-tile-content>
                </v-list-tile>
                <div v-for="(item, index) in getPrizes(date)"
                     :key="'prizes' + index"
                     style="text-align: center"
                >
                    <span class="green--text"
                          :title="item.comment"
                    >
                        {{ `Премия: ${item.amount}` }}
                    </span>
                </div>
                <div v-for="(item, index) in getForfeits(date)"
                     :key="'forfeits' + index"
                     style="text-align: center"
                >
                        <span class="red--text"
                              :title="item.comment"
                        >
                            {{ `Штраф: ${item.amount}` }}
                        </span>
                </div>
            </v-list>
        </td>
    </tr>
</template>
<script>
    import UserPrizes from './UserPrizes'
    import UserForfeits from './UserForfeits'
    import UserSicks from './UserSicks'
    import UserPrepays from './UserPrepays'
    import UserVacations from './UserVacations'
    import MonthRateEditor from './MonthRateEditor'
    import UserTotalField from './UserTotalField'

    const clearDate = deal => deal.created_at.includes('T') ? deal.created_at.split('T')[0] : deal.created_at.split(' ')[0]

    export default {
        name: 'UserRow',
        props: ['user'],
        data: () => ({
            totalPrepays: 0,
            totalSicks: 0,
            totalForfeits: 0,
            totalPrizes: 0,
            totalVacations: 0
        }),
        computed: {
            servicesIncomeAmount () {
                return this.servicesIncome * this.user.services_rate
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            servicesIncome () {
                let deals = this.user && this.user.monthDeals
                return deals.filter(deal => deal.action_type === 'service')
                    .reduce((a, b) => a + +b.income, 0)
            },
            salesIncomeAmount () {
                return this.user.sales_rate * this.salesIncome
            },
            salesIncome () {
                const add = (a, b) => a + +b.income
                let deals = this.user && this.user.monthDeals
                if (this.workingIslandId) {
                    deals = deals.filter(item => +item.island_id === +this.workingIslandId && item.action_type === 'sale')
                }
                return deals.reduce(add, 0)
            },
            salaryOptions () {
                const adminServicesIncomeCount = () => this.workingIsland.options.adminServiceIncomeCount || false
                const specServicesIncomeCount = () => this.workingIsland.options.specServiceIncomeCount || false
                const adminSalesIncomeCount = () => this.workingIsland.options.adminSalesIncomeCount || false
                const specSalesIncomeCount = () => this.workingIsland.options.specSalesIncomeCount || false
                const adminDealsIncome = () => this.workingIsland.options.adminDealsIncome || false
                const specDealsIncome = () => this.workingIsland.options.specDealsIncome || false
                return  {
                    specServicesIncomeCount: this.workingIsland && this.workingIsland.options
                        && specServicesIncomeCount() || false,
                    adminServicesIncomeCount: this.workingIsland && this.workingIsland.options
                        && adminServicesIncomeCount() || false,
                    specSalesIncomeCount: this.workingIsland && this.workingIsland.options
                        && specSalesIncomeCount() || false,
                    adminSalesIncomeCount: this.workingIsland && this.workingIsland.options
                        && adminSalesIncomeCount() || false,
                    specDealsIncome: this.workingIsland && this.workingIsland.options
                        && specDealsIncome() || false,
                    adminDealsIncome: this.workingIsland && this.workingIsland.options
                        && adminDealsIncome() || false,
                    adminAppointmentsCount: this.workingIsland && this.workingIsland.options
                        && this.workingIsland.options.adminAppointmentsCount || false,
                    specAppointmentsCount: this.workingIsland && this.workingIsland.options
                        && this.workingIsland.options.specAppointmentsCount || false
                }
            },
            recordsRateAmount () {
                let user = this.user
                if (user.is_admin && this.salaryOptions.adminAppointmentsCount || !user.is_admin && this.salaryOptions.specAppointmentsCount) {
                    return this.user.app_count * this.user.records_rate || 0
                }
                return 0
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            showChiefInfo () {
                return this.isSuperadmin ? true : this.$store.state.settings.data.salaryPage.showChief
            },
            visible () {
                if (this.isSuperadmin) {
                    return true
                }
                if (this.showPersonal && +this.$store.state.authUser.id === +this.user.id || this.showOther && +this.$store.state.authUser.id !== +this.user.id) {
                    return true
                }
                return false
            },
            showPersonal () {
                return this.$store.state.settings.data.salaryPage.showPersonal
            },
            showOther () {
                return this.$store.state.settings.data.salaryPage.showOther
            },
            mustUpdate () {
                return this.$store.state.salary.mustUpdate
            },
            subDealsTotal () {
                return this.user.chief_rate * this.subDealsAmount
            },
            subDealsAmount () {
                const add = (a, b) => a + +b.income
                return this.subDeals.reduce(add, 0)
            },
            subDeals () {
                if (!this.isChief) return []
                let userControlledIslandIdsList = this.user && this.user.controlled_islands && this.user.controlled_islands.length
                    && this.user.controlled_islands.map(island => +island.id)
                let monthDeals = this.$store.state.salary.monthData.allDeals.filter(deal => userControlledIslandIdsList.includes(+deal.island_id) && deal.user_id !== this.user.id)
                return monthDeals.filter(item => +item.user_id !== +this.user.id)
            },
            isChief () {
                if (!this.workingIslandId) {
                    return this.user.controlled_islands && this.user.controlled_islands.length
                }
                return this.user && this.user.controlled_islands && this.user.controlled_islands.length  && !this.workingIslandId || this.user && this.user.controlled_islands && this.user.controlled_islands.length && this.user.controlled_islands.map(item => item.id).includes(this.workingIslandId)
            },
            grandTotal () {
                let base = this.hourRateAmount + this.totalPrizes + this.subDealsTotal - this.totalForfeits + this.totalSicks + this.totalVacations + this.recordsRateAmount
                if (this.user.is_admin && this.salaryOptions.adminDealsIncome || !this.user.is_admin && this.salaryOptions.specDealsIncome) {
                    base  += this.salesRateAmount
                }
                if (this.user.is_admin && this.salaryOptions.adminSalesIncomeCount || !this.user.is_admin && this.salaryOptions.specSalesIncomeCount) {
                    base  += this.salesIncomeAmount
                }
                if (this.user.is_admin && this.salaryOptions.adminServicesIncomeCount || !this.user.is_admin && this.salaryOptions.specServicesIncomeCount) {
                    base  += this.servicesIncomeAmount
                }
                return base
            },
            salesRateAmount () {
                return this.user.sales_rate * this.totalIncome
            },
            hourRateAmount () {
                return this.user.hour_rate * this.totalHours
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            totalExpense () {
                const add = (a, b) => a + +b.expense
                let deals = this.user && this.user.monthDeals
                if (this.workingIslandId) {
                    deals = deals.filter(item => +item.island_id === +this.workingIslandId)
                }
                return deals.reduce(add, 0)
            },
            totalIncome () {
                const add = (a, b) => a + +b.income
                let deals = this.user && this.user.monthDeals
                if (this.workingIslandId) {
                    deals = deals.filter(item => +item.island_id === +this.workingIslandId)
                }
                return deals.reduce(add, 0)
            },
            totalHours () {
                let workdays = this.user && this.user.monthWorkdays
                if (this.workingIslandId) {
                    workdays = workdays.filter(item => +item.island_id === +this.workingIslandId)
                }
                const add = (a, b) => a + +b.working_hours
                return workdays.reduce(add, 0)
            },
            totalDeals () {
                let deals = this.user && this.user.monthDeals
                if (this.workingIslandId) {
                    deals = deals.filter(item => +item.island_id === +this.workingIslandId)
                }
                return deals.length
            },
            basePath () {
                return this.$store.state.basePath
            },
            dates () {
                let today = new Date(this.$store.state.realDate)
                let tomorrow = today.setDate(today.getDate() + 1)
                return this.user && this.user.dates.filter(item => new Date(item) < tomorrow)
            }
        },
        methods: {
            unmarkedDate (dateString) {
                let targetWorkday = this.user && this.user.monthWorkdays && this.user.monthWorkdays.find(item => item.date === dateString)
                if (!targetWorkday) return false
                return (!!targetWorkday.time_start && !targetWorkday.time_finish)
            },
            calculateTotals (data) {
                if (data && data.monthPrizes) {
                    this.totalPrizes = data.prizes
                } else {
                    this.totalPrizes = this.$refs.prizes && this.$refs.prizes.totalPrizesAmount
                }
                if (data && data.forfeits) {
                    this.totalForfeits = data.forfeits
                } else {
                    this.totalForfeits = this.$refs.forfeits && this.$refs.forfeits.totalForfeitsAmount
                }
                if (data && data.sicks) {
                    this.totalSicks = data.sicks
                } else {
                    this.totalSicks = this.$refs.sicks && this.$refs.sicks.totalSicksAmount
                }
                if (data && data.prepays) {
                    this.totalPrepays = data.prepays
                } else {
                    this.totalPrepays = this.$refs.prepays && this.$refs.prepays.totalPrepaysAmount
                }
                if (data && data.vacations) {
                    this.totalVacations = data.vacations
                } else {
                    this.totalVacations = this.$refs.vacations && this.$refs.vacations.totalVacationsAmount
                }
            },
            isHoliday (textDate) {
                let day = this.$moment(textDate).format('dddd')
                return ['суббота', 'воскресенье'].includes(day)
            },
            hDate (textDate) {
                let date = new Date(textDate)
                let options = {month: 'short', day: 'numeric', year: 'numeric'}
                return date.toLocaleDateString('ru-RU', options)
            },
            getDealsExpense (dateString) {
                let deals = this.user.monthDeals.filter(deal => clearDate(deal) === dateString)
                if (this.workingIslandId) {
                    deals = deals.filter(item => +item.island_id === +this.workingIslandId)
                }
                return deals.reduce((a, b) => a + +b.expense, 0)
            },
            getDealsIncome (dateString) {
                let deals = this.user.monthDeals.filter(deal => clearDate(deal) === dateString)
                if (this.workingIslandId) {
                    deals = deals.filter(item => +item.island_id === +this.workingIslandId)
                }
                return deals.reduce((a, b) => a + +b.income, 0)
            },
            getDealCount (dateString) {
                let base = this.user.monthDeals
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                return base.filter(deal => clearDate(deal) === dateString).length
            },
            getHours (dateString) {
                let base = this.user.monthWorkdays
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                let targetDay = base.find(day => day.date === dateString)
                return targetDay && targetDay.working_hours || 0
            },
            getForfeits (dateString) {
                let base = this.user.monthForfeits
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                return base.filter(item => clearDate(item) === dateString)
            },
            getPrizes (dateString) {
                let base = this.user.monthPrizes
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                return base.filter(item => clearDate(item) === dateString)
            }
        },
        mounted () {
            this.calculateTotals()
        },
        watch: {
            mustUpdate (val) {
                if (val) {
                    this.calculateTotals()
                }
            }
        },
        components: {
            UserVacations,
            UserPrizes,
            UserForfeits,
            UserSicks,
            UserPrepays,
            MonthRateEditor,
            UserTotalField
        }
    }
</script>
<style scoped>
    .day-field {
        border: 1px solid black!important;
        padding: 0!important;
    }
    .total-tab {
        height: 1em;
        padding: .1em 1em!important;
        text-align: left;
    }
    .info-tab {
        height: 1em;
        padding: .1em 1em!important;
        text-align: right;
    }
</style>
