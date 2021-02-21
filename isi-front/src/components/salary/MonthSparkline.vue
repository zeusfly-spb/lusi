<template>
    <v-sparkline
            v-if="dates && dates.length"
            height="30"
            :value="sparklineCommonValue"
            :gradient="gradient"
            :smooth="radius || false"
            :padding="padding"
            :line-width="width"
            :stroke-linecap="lineCap"
            :gradient-direction="gradientDirection"
            auto-draw
    />
</template>

<script>
    const gradients = [
        ['#222'],
        ['#42b3f4'],
        ['red', 'orange', 'yellow'],
        ['purple', 'violet'],
        ['#00c6ff', '#F0F', '#FF0'],
        ['#f72047', '#ffd200', '#1feaea']
    ]
    export default {
        name: 'MonthSparkline',
        data: () => ({
            width: 1,
            radius: 10,
            padding: 8,
            lineCap: 'round',
            gradient: gradients[5],
            value: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0],
            gradientDirection: 'bottom',
            gradients
        }),
        computed: {
            sparklineCommonValue () {
                const value = () => this.dates.map(item => this.dateIncome({date: item, isCache: true}) + this.dateIncome({date: item, isCache: false}))
                return this.dates.length ? value() : []
            },
            sparklineCashlessValue () {
                const value = () => this.dates.map(item => this.dateIncome({date: item, isCache: false}))
                return this.dates.length ? value() : []
            },
            sparklineCashValue () {
                const value = () => this.dates.map(item => this.dateIncome({date: item, isCache: true}))
                return this.dates.length ? value() : []
            },
            deals () {
                return this.$store.state.salary.monthData && this.$store.state.salary.monthData.allDeals || []
            },
            workingIslandId () {
                return +this.$store.state.workingIslandId
            },
            dates () {
                let today = new Date(this.$store.state.realDate)
                let tomorrow = today.setDate(today.getDate() + 1)
                return this.monthData && this.monthData.dates.filter(item => new Date(item) < tomorrow)
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
            dateIncome ({date, isCache}) {
                let deals = this.deals && this.deals.filter(item => item.created_at.split(' ')[0] === date && item.is_cache === isCache)
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

<style scoped>
text {
    transform: rotate(90deg)!important;
}
.g {
    transform: rotate(-90deg)!important;
    text-orientation: mixed!important;
}
</style>