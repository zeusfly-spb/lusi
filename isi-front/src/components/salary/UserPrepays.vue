<template>
    <v-flex>
        <strong
            @click="dialog = true"
            class="clickable"
            v-if="canUpdate && workingIslandId"
        >
            {{ +totalPrepaysAmount.toFixed(2) | pretty }}
        </strong>
        <strong v-else>{{ +totalPrepaysAmount.toFixed(2) | pretty }}</strong>
        <v-dialog
            v-model="dialog"
            max-width="1000px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                <span class="title white--text">
                    {{ `Выплаты сотруднику ${user.full_name}`}}
                </span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md
                                 class="margin-less"
                    >
                        <v-flex>
                            <v-data-table
                                :items="prepays"
                                :headers="headers"
                                hide-actions
                            >
                                <template v-slot:items="props">
                                    <td>
                                        <v-icon
                                            class="red--text clickable"
                                            :title="`Удалить выплату сотрудника ${user.full_name} на сумму ${props.item.amount} ${props.item.comment}`"
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
                                    <span class="red--text">Нет выплат</span>
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
                                    @click="addPrepay"
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
                        Добавить выплату
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="prompt"
            max-width="500px"
            v-if="prepayToDelete"
        >
            <v-card>
                <v-card-title><span class="headline">Подтвержение</span></v-card-title>
                <v-card-text>
                    <v-layout grid-list-md>
                        {{`Удалить выплату сотрудника ${user.full_name} от ${$store.state.hDate(prepayToDelete.created_at)} на сумму ${prepayToDelete.amount} р. ${prepayToDelete.comment}?`}}
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="prompt = false">Закрыть</v-btn>
                    <v-btn
                        color="red darken-1"
                        flat
                        @click="deletePrepay"
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
        name: 'UserPrepays',
        props: ['user'],
        data: () => ({
            prepayToDelete: null,
            prompt: false,
            dialog: false,
            adding: false,
            amount: '',
            comment: '',
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
            prepays () {
                let base = this.user.monthPrepays || []
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                return base
            },
            totalPrepaysAmount () {
                const add = (a, b) => a + +b.amount
                return this.prepays.reduce(add, 0)
            }
        },
        methods: {
            deletePrepay () {
                this.$store.dispatch('deleteUserPrepay', this.prepayToDelete)
                    .then(() => this.prompt = false)
            },
            showPrompt (prepay) {
                this.prepayToDelete = prepay
                this.prompt = true
            },
            addPrepay () {
                this.$store.dispatch('addUserPrepay', {
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
            totalPrepaysAmount (val) {
                this.$emit('update', {prepays: val})
            }
        }
    }
</script>
<style scoped>
    TD {
        text-align: center;
    }
    .margin-less {
        padding: 0!important;
        margin: 0!important;
    }
    .clickable {
        cursor: pointer;
    }
</style>
