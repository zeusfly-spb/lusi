<template>
    <tr v-if="isSuperadmin || showTotal">
        <td
            style="border: 1px solid black; padding: 0; height: 3em!important; width: 30em !important"
            align="right"
        >
            <table>
                <tr
                    class="condensed-row"
                >
                    <td
                        align="left"
                        style="padding-left: 0!important;"
                    >
                        Приход наличными платежами:
                    </td>
                    <td
                        align="right"
                    >
                        {{ totalIncome(true) | pretty }}
                    </td>
                </tr>
                <tr
                    class="condensed-row"
                >
                    <td
                        align="left"
                        style="padding-left: 0!important;"
                    >
                        Приход безналичными платежами:
                    </td>
                    <td
                        align="right"
                    >
                        {{ totalIncome(false) | pretty }}
                    </td>
                </tr>
                <tr
                    class="condensed-row"
                >
                    <td
                        align="left"
                        style="padding-left: 0!important;"
                    >
                        Приход всего:
                    </td>
                    <td
                        align="right"
                    >
                        {{ totalIncome(false) + totalIncome(true) | pretty }}
                    </td>
                </tr>
            </table>
        </td>
        <td
            v-for="(date, index) in dates"
            :key="index"
            width="5em"
            style="border: 1px solid black!important; padding: 0"
            :title="`ИТОГО за ${hDate(date)}`"
            :class="{'red lighten-5': isHoliday(date)}"
            align="right"
        >
            <table>
                <tr
                    class="condensed-row"
                >
                    <td
                        align="right"
                    >
                        {{ dateIncome({date: date, isCache: true}) | pretty }}
                    </td>
                </tr>
                <tr
                    class="condensed-row"
                >
                    <td
                        align="right"
                    >
                        {{ dateIncome({date: date, isCache: false}) | pretty }}
                    </td>
                </tr>
                <tr
                    class="condensed-row"
                >
                    <td
                        align="right"
                    >
                        {{ dateIncome({date: date, isCache: false}) + dateIncome({date: date, isCache: true}) | pretty }}
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</template>
<script>
    export default {
        name: 'TotalDataRow',
        props: ['dates'],
        computed: {

            busy () {
                return this.$store.getters.busy
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            showTotal () {
                return this.$store.state.settings.data.salaryPage.showTotal
            },
            deals () {
                return this.$store.state.salary.monthData && this.$store.state.salary.monthData.allDeals
            },
            basePath () {
                return this.$store.state.basePath
            }
        },
        methods: {
            dateIncome ({date, isCache}) {
                const clearDate = deal => deal.created_at.includes('T') ? deal.created_at.split('T')[0] : deal.created_at.split(' ')[0]
                let deals = this.deals && this.deals.filter(item => clearDate(item) === date && item.is_cache === isCache)
                const add = (a, b) => a + +b.income
                return deals.reduce(add, 0)
            },
            hDate (textDate) {
                return this.$moment(textDate).format('D MMM')
            },
            totalIncome (isCache) {
                let deals = this.deals && this.deals.filter(item => item.is_cache === isCache)
                const add = (a, b) => a + +b.income
                return deals && deals.reduce(add, 0)
            },
            isHoliday (textDate) {
                let day = this.$moment(textDate).format('dddd')
                return ['суббота', 'воскресенье'].includes(day)
            }
        }
    }
</script>
<style>
    .condensed-row > TD {
        margin: 0 2px!important;
        height: 1.8em!important;
        font-weight: bold!important;
    }
</style>

