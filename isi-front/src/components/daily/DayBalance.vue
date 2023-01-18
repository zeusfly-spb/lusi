<template>
    <v-flex xs12 md6 offset-md3 justify-center class="md2">
<!--        <v-btn-->
<!--                color="pink"-->
<!--                dark-->
<!--                absolute-->
<!--                top-->
<!--                fab-->
<!--                style="left: 20px; top: 20px"-->
<!--                title="Прослушать аудио отчет системы"-->
<!--                v-if="!workingIslandId"-->
<!--                @click="pushVoiceReport"-->
<!--                @touchend="pushVoiceReport"-->
<!--        >-->
<!--            <v-icon>hearing</v-icon>-->
<!--        </v-btn>-->
        <v-data-table
            :headers="headers"
            :items="items"
            hide-actions
            class="elevation-1"
        >
            <template v-slot:items="props">
                <td align="center">{{ props.item.start | pretty }}</td>
                <td align="center"
                >
                    <hand-over-control v-if="handover"/>
                    <v-btn v-if="!handover && isToday"
                           :disabled="!$store.state.workingIslandId"
                           flat
                           @click="showDialog"
                           color="primary"
                    >
                        Сдать кассу
                    </v-btn>
                    <span v-if="!handover && !isToday">0</span>
                </td>
                <td align="center">
                    {{ props.item.expenses | pretty }}
                </td>

                <td align="center">{{ props.item.finish | pretty }}</td>
                <td align="center"
                    class="teal--text darken-3"
                >
                    <span v-if="cashlessPresent">{{ cashlessAmount | pretty }}</span>
                    <span v-else>0</span>
                </td>

            </template>
        </v-data-table>
        <v-dialog
            v-model="dialog"
            max-width="300"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Сдать кассу</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12>
                                <v-text-field
                                    v-model="amount"
                                    label="Сумма"
                                    data-vv-as="Сумма"
                                    data-vv-name="amount"
                                    :error-messages="errors.collect('amount')"
                                    v-validate="'required|integer'"
                                    autofocus
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="dialog = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="saveHandover">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-flex>
</template>
<script>
    import ExpensesTable from './ExpensesTable'
    import HandOverControl from './HandOverControl'
    export default {
        name: 'DayBalance',
        data: () => ({
            amount: null,
            dialog: false,
            headers: [
                {text: 'На начало дня', value: null, sortable: false, align: 'center'},
                {text: 'Сдано', value: null, sortable: false, align: 'center'},
                {text: 'Расходы', value: null, sortable: false, align: 'center'},
                {text: 'На конец дня', value: null, sortable: false, align: 'center'},
                {text: 'Безналичные платежи', value: null, sortable: false, align: 'center'}
            ]
        }),
        computed: {
            workingIslandId () {
                return this.$store.getters.workingIslandId
            },
            realDate () {
                return this.$store.state.realDate
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            handover () {
                return this.$store.state.handover
            },
            cashlessAmount () {
                const add = (a, b) => +a + +b.income - +b.expense
                return this.cashlessDeals.reduce(add, 0)
            },
            cashlessPresent () {
                return this.cashlessDeals.length > 0
            },
            cashlessDeals () {
                return this.$store.state.deals.filter(item => !item.is_cache)
            },
            expenses () {
                return this.$store.state.expenses
            },
            currentBalance () {
                const calculate = (a, b) => b.is_cache ? +a + +b.income - +b.expense : +a
                return this.$store.state.deals.reduce(calculate, 0)
            },
            items () {
                const add = (a, b)=> a + +b.amount
                return [
                    {
                        start: this.$store.state.startBalance,
                        expenses: this.expenses.reduce(add, 0),
                        finish: this.$store.state.startBalance + this.currentBalance - this.expenses.reduce(add, 0) - this.handover
                    }
                    ]
            }
        },
        methods: {
            pushVoiceReport () {
                let accountingDate = this.$moment(this.$store.state.accountingDate).format('D MMMM YYYY года.')
                let report = `На ${accountingDate} приход всего ${this.$store.getters.totalDealIncome} рублей из ни ${this.cashlessAmount} безналичными платежами`
                this.$store.dispatch('pushVoiceMessage', report)
            },
            saveHandover () {
                this.$store.dispatch('addHandOver', this.amount)
                    .then(() => {
                        this.dialog = false
                    })
            },
            showDialog () {
                this.dialog = true
            }
        },
        components: {
            ExpensesTable,
            HandOverControl
        }
    }
</script>
<style scoped>
    .round-corner {
        border-radius: 5px;
    }
</style>
