<template>
    <v-flex align-center>
        <v-snackbar
            v-model="snackbar"
            auto-height
            top
            :timeout="3000"
            :color="snackColor"
        >
            <span>{{ snackText }}</span>
        </v-snackbar>
        <island-switcher/>
        <deals-table/>
        <day-balance/>
        <expenses-table @snack="showSnack"/>
        <work-days-table/>
        <work-day-adder v-if="isSuperadmin" @snack="showSnack"/>

    </v-flex>
</template>
<script>
    import WorkDaysTable from './WorkDaysTable'
    import DealsTable from './DealsTable.vue'
    import DayBalance from './DayBalance'
    import ExpensesTable from './ExpensesTable'
    import WorkDayAdder from './WorkDayAdder'
    import IslandSwitcher from '../IslandSwitcher'

    export default {
        name: 'DailyAccounting',
        data: () => ({
            snackbar: false,
            snackText: '',
            snackColor: 'green'
        }),
        computed: {
            isAuth () {
                return this.$store.getters.isAuth
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        methods: {
            showSnack (text, color) {
                this.snackText = text
                this.snackColor = color
                this.snackbar = true
            }
        },
        components: {
            WorkDaysTable,
            DealsTable,
            DayBalance,
            ExpensesTable,
            WorkDayAdder,
            IslandSwitcher
        }
    }
</script>
