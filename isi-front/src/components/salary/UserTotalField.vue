<template>
    <td
        style="border: 1px solid black; padding: 0"
        align="right"
    >
        <v-card
            style="width: 30em"
            elevation="0"
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
            <v-card-text
                class="p-0 pt-0"
            >
                <table>
                    <tr>
                        <td class="info-tab">
                            Наименование
                        </td>
                        <td class="info-tab">
                            Всего
                        </td>
                        <td class="info-tab">
                            Сумма
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
                            <strong>{{ +totalHourAmount.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr v-if="showDealsIncome">
                        <td class="info-tab">
                            Оборот
                        </td>
                        <td class="info-tab">
                            <strong >{{ +totalIncome.toFixed(2) | pretty }}</strong>
                        </td>

                        <td class="info-tab">
                            <strong>{{ +totalIncomeAmount.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr v-if="showSalesIncome">
                        <td class="info-tab">
                            Оборот с продаж
                        </td>
                        <td class="info-tab">
                            <strong >{{ +salesIncome.toFixed(2) | pretty }}</strong>
                        </td>
                        <td class="info-tab">
                            <strong>{{ +salesIncomeAmount.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr v-if="showServicesIncome">
                        <td class="info-tab">
                            Оборот с услуг
                        </td>
                        <td class="info-tab">
                            <strong >{{ +servicesIncome.toFixed(2) | pretty }}</strong>
                        </td>
                        <td class="info-tab">
                            <strong>{{ +servicesIncomeAmount.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr
                        v-if="showRecords"
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
                            <strong>{{ totalRecordsAmount }}</strong>
                        </td>
                    </tr>
                    <tr
                        v-if="isChief"
                        class="light-blue lighten-4"
                    >
                        <td class="info-tab">
                            Руководящий оборот
                        </td>
                        <td class="info-tab">
                            <strong >{{ +controlledIslandsIncome.toFixed(2) | pretty }}</strong>
                        </td>
                        <td class="info-tab">
                            <strong>{{ +controlledIslandsAmount.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="info-tab">
                            Премии
                        </td>
                        <td class="info-tab"/>
                        <td class="info-tab">
                            <strong>{{ totalPrizesAmount | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="info-tab">
                            Штрафы
                        </td>
                        <td class="info-tab"/>
                        <td class="info-tab">
                            <strong>{{ totalForfeitsAmount | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="info-tab">
                            Больничные
                        </td>
                        <td class="info-tab"/>
                        <td class="info-tab">
                            <strong>{{ totalSicksAmount | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="info-tab">
                            Отпускные
                        </td>
                        <td class="info-tab"/>
                        <td class="info-tab">
                            <strong>{{ totalVacationsAmount | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="total-tab"
                            colspan="2"
                        >
                            <strong>ИТОГО</strong>
                        </td>
                        <td class="info-tab">
                            <strong>{{ +grandTotal.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="total-tab"
                            colspan="2"
                        >
                            <strong>Остаток</strong>
                        </td>
                        <td class="info-tab">
                            <strong>{{ +(grandTotal - totalPrepaysAmount).toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                    <tr>
                        <td class="total-tab"
                            colspan="2"
                        >
                            <strong>Выдано</strong>
                        </td>
                        <td class="info-tab">
                            <strong>{{ +totalPrepaysAmount.toFixed(2) | pretty }}</strong>
                        </td>
                    </tr>
                </table>
            </v-card-text>

        </v-card>
    </td>
</template>
<script>
    export default {
        name: 'UserTotalField',
        props: ['user'],
        computed: {
            servicesIncomeAmount () {
                let islandIds = this.deals
                    .filter(deal => deal.action_type === 'service')
                    .map(deal => +deal.island_id)
                let uniqIslandIds = [... new Set(islandIds)]
                return uniqIslandIds
                    .map(id => ({
                        id: id,
                        income: this.deals
                            .filter(deal => +deal.island_id === id && deal.action_type === 'service')
                            .reduce((a, b) => a + +b.income, 0),
                        rate: this.$store.state.userRate({user: this.user, island_id: id, month: this.currentMonth, rate: 'services'})
                    }))
                    .map(item => item.income * item.rate)
                    .reduce((a, b) => a + b, 0)
            },
            servicesIncome () {
                return this.deals.filter(deal => deal.action_type === 'service')
                    .reduce((a, b) => a + +b.income, 0)
            },
            showServicesIncome () {
                let allDeals = this.$store.state.salary.monthData.allDeals || []
                let islandIds = [... new Set(allDeals.map(item => +item.island_id))]
                if (!islandIds.length) {
                    return false
                }
                return islandIds.map(id => ({id: id, show: this.showServices(id)}))
                    .reduce((a, b) => a + b.show, false)
            },
            showSalesIncome () {
                let allDeals = this.$store.state.salary.monthData.allDeals || []
                let islandIds = [... new Set(allDeals.map(item => +item.island_id))]
                if (!islandIds.length) {
                    return false
                }
                return islandIds.map(id => ({id: id, show: this.showSales(id)}))
                    .reduce((a, b) => a + b.show, false)
            },
            salesIncomeAmount () {
                let islandIds = this.deals
                    .filter(deal => deal.action_type === 'sale')
                    .map(deal => +deal.island_id)
                let uniqIslandIds = [... new Set(islandIds)]
                return uniqIslandIds
                    .map(id => ({
                        id: id,
                        income: this.deals
                            .filter(deal => deal.action_type === 'sale' && +deal.island_id === id)
                            .reduce((a, b) => a + +b.income, 0),
                        rate: this.$store.state.userRate({
                            user: this.user,
                            island_id: id,
                            month: this.currentMonth,
                            rate: 'sales'
                        })
                    }))
                    .map(item => item.rate * item.income)
                    .reduce((a, b) => a + b, 0)
            },
            salesIncome () {
                return this.deals.filter(deal => deal.action_type === 'sale')
                    .reduce((a, b) => a + +b.income, 0)
            },
            showDealsIncome () {
                let allDeals = this.$store.state.salary.monthData.allDeals || []
                let islandIds = [... new Set(allDeals.map(item => +item.island_id))]
                if (!islandIds.length) {
                    return false
                }
                return islandIds.map(id => ({id: id, show: this.showDeals(id)}))
                    .reduce((a, b) => a + b.show, false)
            },
            showRecords () {
                let allAppointments = this.$store.state.salary.monthData.allAppointments || []
                let islandIds = [... new Set(allAppointments.map(item => +item.island_id))]
                if (!islandIds.length) {
                    return false
                }
                return islandIds.map(id => ({id: id, show: this.countRecords(id)}))
                    .reduce((a, b) => a + b.show, false)
            },
            totalRecordsAmount () {
                const countRecords = island_id => {
                    let island = this.$store.state.islands.find(island => +island.id === +island_id)
                    if (this.user.is_admin) {
                        return island.options.adminAppointmentsCount || false
                    } else {
                        return island.options.specAppointmentsCount || false
                    }
                }
                let allAppointments = this.$store.state.salary.monthData.allAppointments
                let userAppointments
                if (this.user.is_admin) {
                    userAppointments = allAppointments.filter(event => +event.user_id === +this.user.id)
                } else {
                    userAppointments = allAppointments.filter(event => +event.performer_id === +this.user.id)
                }
                let appointmentsIslandIds = [... new Set(userAppointments.map(event => event.island_id))]
                return appointmentsIslandIds.map(id => ({
                    island_id: id,
                    app_count: userAppointments.filter(app =>  +app.island_id === +id).length,
                    record_rate: this.$store.state.userRate({user: this.user, island_id: id, month: this.currentMonth, rate: 'records'})
                }))
                    .filter(item => countRecords(item.island_id))
                    .map(item => ({
                        island_id: item.island_id,
                        amount: item.app_count * item.record_rate
                    }))
                    .reduce((a, b) => a + b.amount, 0)
            },
            grandTotal () {
                let base = this.totalHourAmount + this.totalPrizesAmount + this.controlledIslandsAmount - this.totalForfeitsAmount
                    + this.totalSicksAmount + this.totalVacationsAmount
                if (this.showDealsIncome) {
                    base += this.totalIncomeAmount
                }
                if (this.showRecords) {
                    base += this.totalRecordsAmount
                }
                if (this.showServices) {
                    base += this.servicesIncomeAmount
                }
                return base
            },
            isChief () {
                return this.user && this.user.controlled_islands && this.user.controlled_islands.length
            },
            currentMonth () {
                return this.$store.state.accountingDate && this.$store.state.accountingDate.split('-').slice(0, 2).join('-') || null
            },
            workdays () {
                return this.user && this.user.monthWorkdays || []
            },
            deals () {
                return this.user && this.user.monthDeals || []
            },
            totalHours () {
                return this.workdays.reduce((a, b) => a + +b.working_hours, 0)
            },
            totalHourAmount () {
                return [... new Set(this.workdays.map(item => item.island_id))]
                    .map(id => ({id: id}))
                    .map(island => ({
                        ... island,
                        hours: this.workdays.filter(workday => workday.island_id === island.id).reduce((a, b) => a + +b.working_hours, 0)
                    }))
                    .map(island => ({
                        ... island,
                        amount: island.hours * this.$store.state.userRate({user: this.user, island_id: island.id, month: this.currentMonth, rate: 'hours'})
                    }))
                    .reduce((a, b) => a + b.amount, 0)
            },
            totalIncome () {
                return this.deals.reduce((a, b) => a + +b.income, 0)
            },
            totalIncomeAmount () {
                return [... new Set(this.deals.map(deal => deal.island_id))]
                    .map(item => ({id: item}))
                    .map(island => ({
                        ... island,
                        totalDeals: this.deals.filter(deal => deal.island_id === island.id).reduce((a, b) => a + +b.income, 0)
                    }))
                    .map(island => ({
                        ... island,
                        dealsAmount: island.totalDeals * this.$store.state.userRate({user: this.user, island_id: island.id, month: this.currentMonth, rate: 'sales'})
                    }))
                    .reduce((a, b) => a + b.dealsAmount, 0)
            },
            controlledIslandIds () {
                return this.user && this.user.controlled_islands.map(item => +item.id) || []
            },
            controlledIslandsIncome () {
                return this.$store.state.salary.monthData.allDeals
                    .filter(deal => this.controlledIslandIds.includes(deal.island_id) && +deal.user_id !== +this.user.id)
                    .reduce((a, b) => a + +b.income, 0)
            },
            controlledIslandsAmount () {
                return this.controlledIslandIds
                    .map(item => ({id: item}))
                    .map(island => ({... island, deals: this.$store.state.salary.monthData.allDeals.filter(deal => deal.island_id === island.id && deal.user_id !== this.user.id)}))
                    .map(island => ({... island, dealsIncome: island.deals.reduce((a, b) => a + +b.income, 0)}))
                    .map(island => ({
                        ... island,
                        chiefAmount: island.dealsIncome * this.$store.state.userRate({user: this.user, month: this.currentMonth, island_id: island.id, rate: 'chief'})
                    }))
                    .reduce((a, b) => a + b.chiefAmount, 0)
            },
            totalPrepaysAmount () {
                return this.user && this.user.monthPrepays && this.user.monthPrepays.reduce((a, b) => a + +b.amount, 0) || 0
            },
            totalPrizesAmount () {
                return this.user && this.user.monthPrizes && this.user.monthPrizes.reduce((a, b) => a + +b.amount, 0) || 0
            },
            totalForfeitsAmount () {
                return this.user && this.user.monthForfeits && this.user.monthForfeits.reduce((a, b) => a + +b.amount, 0) || 0
            },
            totalSicksAmount () {
                return this.user && this.user.monthSicks && this.user.monthSicks.reduce((a, b) => a + +b.amount, 0) || 0
            },
            totalVacationsAmount () {
                return this.user && this.user.monthVacations && this.user.monthVacations.reduce((a, b) => a + +b.amount, 0) || 0
            },
            basePath () {
                return this.$store.state.basePath
            }
        },
        methods: {
            showServices (island_id) {
                let island = this.$store.state.islands.find(island => +island.id === +island_id)
                if (this.user.is_admin) {
                    return island.options.adminServiceIncomeCount || false
                } else {
                    return island.options.specServiceIncomeCount || false
                }
            },
            showSales (island_id) {
                let island = this.$store.state.islands.find(island => +island.id === +island_id)
                if (this.user.is_admin) {
                    return island.options.adminSalesIncomeCount || false
                } else {
                    return island.options.specSalesIncomeCount || false
                }
            },
            showDeals (island_id) {
                let island = this.$store.state.islands.find(island => +island.id === +island_id)
                if (this.user.is_admin) {
                    return island.options.adminDealsIncome || false
                } else {
                    return island.options.specDealsIncome || false
                }
            },
            countRecords (island_id) {
                let island = this.$store.state.islands.find(island => +island.id === +island_id)
                if (this.user.is_admin) {
                    return island.options.adminAppointmentsCount || false
                } else {
                    return island.options.specAppointmentsCount || false
                }
            }
        }
    }
</script>
<style scoped>
    .total-tab {
        height: 1em;
        padding: .1em 1em!important;
        text-align: left;
    }
    .info-tab {
        height: 1em;
        padding: .1em 1em!important;
        text-align: right!important;
    }
</style>

