<template>
    <v-layout justify-center class="mt-1">
        <v-flex xs12 sm6 md4 justify-center>

            <div class="text-xs-center">
                <table style="margin: auto">
                    <tr
                        v-for="expense in expenses"
                        :key="expense.id"
                    >
                        <td>
                            <v-icon
                                class="red--text delete"
                                :title="`Удалить расход ${expense.comment} ${expense.amount}р.`"
                                @click="attemptToDelete(expense)"
                                v-if="isToday"
                            >
                                clear
                            </v-icon>
                        </td>
                        <td>
                            <v-avatar
                                size="36px"
                            >
                                <img :src="basePath + expense.user.avatar" alt="Фото" v-if="expense.user.avatar">
                                <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else>
                            </v-avatar>
                        </td>
                        <td>
                            {{ expense.amount }}
                        </td>
                        <td>
                            {{ expense.comment }}
                        </td>
                    </tr>
                </table>

                <v-btn color="primary" flat dark class="mb-2" @click="showDialog"
                       :disabled="$store.state.workingIslandId === 0 || !isToday"
                >
                    Добавить расход
                </v-btn>
            </div>
            <v-dialog
                v-model="dialog"
                max-width="400px"
            >
                <v-card class="round-corner">
                    <v-card-title class="light-blue darken-3">
                        <span class="title white--text">Добавить расход</span>
                    </v-card-title>
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex xs12 sm6 md6>
                                    <v-text-field
                                        label="Сумма"
                                        autofocus
                                        maxlength="5"
                                        v-model="amount"
                                        data-vv-as="Сумма"
                                        data-vv-name="amount"
                                        :error-messages="errors.collect('amount')"
                                        v-validate="'required|integer'"
                                    />
                                </v-flex>
                                <v-flex xs12 sm6 md6>
                                    <v-text-field
                                        label="Комментарий"
                                        v-model="comment"
                                        data-vv-as="Комментарий"
                                        data-vv-name="comment"
                                        :error-messages="errors.collect('comment')"
                                        v-validate="'required'"
                                    />
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red darken-1" flat @click="dialog = false">Отмена</v-btn>
                        <v-btn color="green darken-1" flat @click="saveExpense">Сохранить</v-btn>
                    </v-card-actions>
                </v-card>

            </v-dialog>
        </v-flex>
        <v-dialog v-model="confirm"
                  max-width="500"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    <span class="title">
                        {{ confirmText }}
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="confirm = false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="red darken-1"
                        flat="flat"
                        @click="deleteExpense"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>

    </v-layout>
</template>
<script>
    export default {
        name: 'ExpensesTable',
        data: () => ({
            expenseToDelete: null,
            confirmText: '',
            confirm: false,
            comment: '',
            amount: '',
            dialog: false,
            headers: [
                {text: 'Действие', width: '1%'},
                {text: 'Фото', width: '1%'},
                {text: 'Сумма', width: '1%'},
                {text: 'Комментарий'}
            ]
        }),
        computed: {
            realDate () {
                return this.$store.state.realDate
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            expenses () {
                return this.$store.state.expenses
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            basePath () {
                return this.$store.state.basePath
            },
            authUser () {
                return this.$store.state.authUser
            },
            isDayOpen () {
                return this.$store.getters.isDayOpen
            },
        },
        methods: {
            deleteExpense () {
                this.$store.dispatch('deleteExpense', this.expenseToDelete.id)
                    .then(() => this.confirm = false)
            },
            attemptToDelete (expense) {
                if (expense.user_id !== this.authUser.id && !this.isSuperadmin) {
                    this.$emit('snack', 'Невозможно удалить чужую запись о расходах!', 'red')
                    return
                }
                this.expenseToDelete = expense
                this.confirmText = `Удалить запись о расходе ${expense.amount}р. ${expense.comment}?`
                this.confirm = true
            },
            saveExpense () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.dialog = false
                        this.$store.dispatch('addExpense', {
                            amount: this.amount,
                            comment: this.comment
                        })
                    })
            },
            showDialog () {
                if (!this.isDayOpen && !this.isSuperadmin) {
                    this.$emit('snack', 'Чтобы добавить расход, начните рабочий день', 'red')
                    return
                }
                this.amount = ''
                this.comment = ''
                this.dialog = true
            }
        }
    }
</script>
<style scoped>
    .delete {
        cursor: pointer;
        opacity: .6;
    }
    .delete:hover {
        opacity: 1;
    }
    .round-corner {
        border-radius: 5px;
    }
</style>
