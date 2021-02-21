<template>
    <v-flex>
        <strong
            @click="dialog = true"
            class="clickable"
            v-if="canUpdate && workingIslandId"
        >
            {{ +totalPrizesAmount.toFixed(2) | pretty }}
        </strong>
        <strong v-else>{{ +totalPrizesAmount.toFixed(2) | pretty }}</strong>
        <v-dialog
            v-model="dialog"
            max-width="700px"
            persistent
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">
                        {{ `Премии сотрудника ${user.full_name}`}}
                    </span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md
                                 style="padding: 0!important; margin: 0!important;"
                    >
                        <v-flex>
                            <v-data-table
                                :items="prizes"
                                :headers="headers"
                                hide-actions
                            >
                                <template v-slot:items="props">
                                    <td>
                                        <v-icon
                                            class="red--text clickable"
                                            :title="`Удалить премию сотрудника ${user.full_name} на сумму ${props.item.amount} ${props.item.comment}`"
                                            @click="showPrompt(props.item)"
                                        >
                                            clear
                                        </v-icon>
                                    </td>
                                    <td>{{ props.item.created_at | moment('DD MMMM YYYY г.') }}</td>
                                    <td>{{ props.item.amount }}</td>
                                    <td>{{ props.item.comment }}</td>
                                </template>
                                <template v-slot:no-data>
                                    <span class="red--text">Нет премий</span>
                                </template>
                            </v-data-table>
                        </v-flex>
                        <v-layout v-if="adding">
                            <v-flex xs4>
                                <v-text-field
                                    label="Сумма"
                                    type="number"
                                    style="width: 4em;"
                                    v-model="amount"
                                    maxlength="7"
                                    height="1em"
                                    autofocus
                                />
                            </v-flex>
                            <v-flex xs8>
                                <v-text-field
                                    label="Комментарий"
                                    v-model="comment"
                                    height="1em"
                                />
                            </v-flex>
                            <v-flex>
                                <v-btn
                                    flat color="green"
                                    @click="addPrize"
                                >
                                    Сохранить
                                </v-btn>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="dialog = false">Закрыть</v-btn>
                    <v-btn
                        color="green darken-1"
                        flat
                        @click="adding=true"
                        :disabled="adding"
                    >
                        Добавить премию
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="prompt"
            max-width="500px"
            v-if="prizeToDelete"
        >
            <v-card>
                <v-card-title><span class="headline">Подтвержение</span></v-card-title>
                <v-card-text>
                    <v-layout grid-list-md>
                        {{`Удалить премию сотрудника ${user.full_name} от ${$store.state.hDate(prizeToDelete.created_at)} на сумму ${prizeToDelete.amount} р. ${prizeToDelete.comment}?`}}
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="prompt = false">Закрыть</v-btn>
                    <v-btn
                        color="red darken-1"
                        flat
                        @click="deletePrize"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'UserPrizes',
        props: ['user'],
        data: () => ({
            prompt: false,
            prizeToDelete: null,
            amount: '',
            comment: '',
            adding: false,
            dialog: false,
            headers: [
                {text: 'Действия', value: null, align: 'center'},
                {text: 'Дата', value: 'created_at', align: 'center'},
                {text: 'Сумма', value: 'amount', align: 'center'},
                {text: 'Комментарий', value: 'comment', align: 'center'}
            ]
        }),
        computed: {
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            canUpdate () {
                return this.isSuperadmin
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            realDate () {
                return this.$store.state.realDate
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            prizes () {
                let base = this.user.monthPrizes || []
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                return base
            },
            totalPrizesAmount () {
                const add = (a, b) => a + +b.amount
                return this.prizes.reduce(add, 0)
            }
        },
        methods: {
            deletePrize () {
                this.$store.dispatch('deleteUserPrize', {id: this.prizeToDelete.id})
                    .then(() => this.prompt = false)
            },
            showPrompt (prize) {
                this.prizeToDelete = prize
                this.prompt = true
            },
            addPrize () {
                if (!this.amount) return
                this.$store.dispatch('addUserPrize', {
                    user_id: this.user.id,
                    amount: this.amount,
                    comment: this.comment,
                    island_id: this.workingIslandId
                })
                    .then(() => this.adding = false)
            }
        },
        watch: {
            dialog (value) {
                if (value) {
                    [this.amount, this.comment, this.adding] = [0, '', false]
                }
            },
            adding (value) {
                if (value) {
                    [this.amount, this.comment] = [0, '']
                }
            },
            totalPrizesAmount (val) {
                this.$emit('update', {prizes: val})
            }
        }
    }
</script>
<style scoped>
    TD {
        text-align: center;
    }
    .clickable {
        cursor: pointer;
    }
    .round-corner {
        border-radius: 5px;
    }
</style>
