<template>
    <v-flex>
        <strong
            @click="dialog = true"
            class="clickable"
            v-if="canUpdate && workingIslandId"
        >
            {{ +totalForfeitsAmount.toFixed(2) | pretty }}
        </strong>
        <strong v-else>{{ +totalForfeitsAmount.toFixed(2) | pretty }}</strong>
        <v-dialog
            v-model="dialog"
            max-width="700px"
            persistent
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                <span class="title white--text">
                    {{ `Штрафы сотрудника ${user.full_name}`}}
                </span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md
                                 class="margin-less"
                    >
                        <v-flex>
                            <v-data-table
                                :items="forfeits"
                                :headers="headers"
                                hide-actions
                            >
                                <template v-slot:items="props">
                                    <td>
                                        <v-icon
                                            class="red--text clickable"
                                            :title="`Удалить штраф сотрудника ${user.full_name} на сумму ${props.item.amount} р. ${props.item.comment} за ${$store.state.hDate(props.item.created_at)}`"
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
                                    <span class="red--text">Нет штрафов</span>
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
                                    @click="addForfeit"
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
                        Добавить штраф
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="prompt"
            max-width="500px"
        >
            <v-card>
                <v-card-title>
                    <span class="headline">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <span v-if="forfeitToDelete">
                            {{`
                            Удалить штраф сотрудника ${user.full_name} от ${$store.state.hDate(forfeitToDelete.created_at)} ${forfeitToDelete.comment.length ? forfeitToDelete.comment : ''}
                             на сумму ${forfeitToDelete.amount} р. ?
                            `}}
                        </span>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="prompt = false">Закрыть</v-btn>
                    <v-btn
                        color="red darken-1"
                        flat
                        @click="deleteForfeit"
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
        name: 'UserForfeits',
        props: ['user'],
        data: () => ({
            forfeitToDelete: null,
            prompt: false,
            dialog: false,
            adding: false,
            amount: '',
            comment: '',
            headers: [
                {text: 'Действие', value: null, align: 'center'},
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
            forfeits () {
                let base = this.user.monthForfeits || []
                if (this.workingIslandId) {
                    base = base.filter(item => +item.island_id === +this.workingIslandId)
                }
                return base
            },
            totalForfeitsAmount () {
                const add = (a, b) => a + +b.amount
                return this.forfeits.reduce(add, 0)
            }
        },
        methods: {
            deleteForfeit () {
                this.$store.dispatch('deleteUserForfeit', this.forfeitToDelete.id)
                    .then(() => this.prompt = false)
            },
            showPrompt (forfeit) {
                this.forfeitToDelete = forfeit
                this.prompt = true
            },
            addForfeit () {
                if (!this.amount) return
                this.$store.dispatch('addUserForfeit', {
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
            totalForfeitsAmount (val) {
                this.$emit('update', {forfeits: val})
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
    .round-corner {
        border-radius: 5px;
    }
</style>
