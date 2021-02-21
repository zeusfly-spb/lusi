<template>
    <span
            v-if="isSuperadmin || isLogist"
    >
        <v-btn icon
               title="Редактирование списка наименований товаров и цен"
               @click="activate"
        >
            <v-icon
                color="green"
                class="clickable"
            >
                edit
            </v-icon>
        </v-btn>

        <v-dialog
            v-model="active"
            persistent
            max-width="1000px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Товары и цены</span>
                    <v-spacer/>
                    <v-icon
                            class="clickable"
                            color="white"
                            @click="active = false"
                            title="Закрыть"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-btn icon
                           title="Добавить наименование товара"
                           @click="showAddDialog"
                    >
                        <v-icon
                            color="green"
                            class="clickable"
                        >
                            add_circle
                        </v-icon>
                    </v-btn>
                    <v-data-table
                        :items="goods"
                        :headers="headers"
                        hide-actions
                    >
                        <template v-slot:items="props">
                            <td>{{ props.index + 1 }}</td>
                            <td>{{ props.item.name }}</td>
                            <td>{{ props.item.price }}</td>
                            <td align="center">
                                <v-icon
                                    v-if="!!props.item.changeable_price"
                                    color="green"
                                >
                                    check
                                </v-icon>
                            </td>
                            <td
                                align="right"
                            >
                                <v-icon
                                    small
                                    class="mr-2 green--text"
                                    @click="openEditDialog(props.item)"
                                    title="Редактировать"
                                >
                                    edit
                                </v-icon>
                                <v-icon
                                    class="mr-2 red--text"
                                    small
                                    @click="showDeleteConfirm(props.item)"
                                    title="Удалить"
                                >
                                    delete
                                </v-icon>
                            </td>
                        </template>
                    </v-data-table>

                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="active=false">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="dialog"
            max-width="800"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">{{ editDialogHeader }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md8>
                                <v-text-field v-model="editGood.name"
                                              v-if="dialog"
                                              label="Наименование"
                                              data-vv-as="Наименование"
                                              data-vv-name="name"
                                              :error-messages="errors.collect('name')"
                                              v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editGood.price"
                                              v-if="dialog"
                                              label="Цена"
                                              data-vv-as="Цена"
                                              data-vv-name="price"
                                              :error-messages="errors.collect('price')"
                                              v-validate="'required|numeric'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-checkbox
                                    v-model="editGood.changeable_price"
                                    label="Изменяемая цена"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="cancel">Отмена</v-btn>
                    <v-btn color="green darken-1"
                           v-if="edit"
                           flat
                           @click="makeAction"
                           :disabled="JSON.stringify(backupGood) === JSON.stringify(editGood) || performing"
                    >
                        Сохранить
                    </v-btn>
                    <v-btn color="green darken-1"
                           v-if="adding"
                           flat
                           @click="makeAction"
                           :disabled="JSON.stringify(backupGood) === JSON.stringify(editGood) || performing"
                    >
                        Добавить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="confirm"
            max-width="500px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    Удалить наименование {{ goodToDelete && goodToDelete.name || ''}}?
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="confirm=false">Отмена</v-btn>
                    <v-btn
                        color="red darken-1"
                        :disabled="performing"
                        flat
                        @click="deleteGood"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </span>
</template>
<script>
    export default {
        name: 'GoodsControl',
        data: () => ({
            performing: false,
            goodToDelete: null,
            dialog: false,
            newGood: {name: '', price: '', changeable_price: false},
            adding: false,
            confirm: false,
            editDialogHeader: '',
            editGood: {name: '', price: '', changeable_price: false},
            backupGood: null,
            edit: false,
            active: false,
            headers: [
                {text: '#', value: null, sortable: false},
                {text: 'Наименование', value: 'name'},
                {text: 'Цена', value: 'price'},
                {text: 'Изменяемая цена', value: 'changeable_price', align: 'center'},
                {text: 'Действия', value: null, sortable: false, align: 'right'}
            ]
        }),
        computed: {
            isLogist () {
                return this.$store.getters.logist
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            goods () {
                let base = this.$store.state.stock.options.products
                return base && base.filter(item => item.description === 'good') || []
            }
        },
        methods: {
            deleteGood () {
                this.performing = true
                this.$store.dispatch('deleteProduct', this.goodToDelete.id)
                    .then(() => {
                        this.confirm = false
                        this.$store.dispatch('pushMessage', {
                            text: `Наименование '${this.goodToDelete.name}' удалено`,
                            color: 'green'
                        })
                    })
                .finally(() => this.performing = false)
            },
            showDeleteConfirm (good) {
                this.goodToDelete = good
                this.confirm = true
            },
            cancel () {
                [this.dialog, this.adding, this.edit] = [false, false, false]
            },
            showAddDialog () {
                this.editDialogHeader = 'Новый товар'
                this.editGood = JSON.parse(JSON.stringify({name: '', price: ''}))
                this.backupGood = JSON.parse(JSON.stringify(this.editGood))
                this.adding = true
                this.dialog = true
            },
            makeAction () {
                if (this.adding) {
                    this.addNewGood()
                } else {
                    this.saveGood()
                }
            },
            addNewGood () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.performing = true
                        this.$store.dispatch('addGood', this.editGood)
                            .then(() => {
                                this.adding = false
                                this.dialog = false
                                this.$store.dispatch('pushMessage', {
                                    text: `Добавлен новый товар '${this.editGood.name}'`,
                                    color: 'green'
                                })
                            })
                        .finally(() => this.performing = false)
                    })
            },
            saveGood () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.performing = true
                        this.$store.dispatch('updateProduct', this.editGood)
                            .then(() => {
                                this.edit = false
                                this.dialog = false
                                this.$store.dispatch('pushMessage', {
                                    text: `Товар '${this.editGood.name}' отредактирован`,
                                    color: 'green'
                                })
                            })
                            .finally(() => this.performing = false)
                    })
            },
            openEditDialog (good) {
                this.editDialogHeader = good.name
                this.editGood = JSON.parse(JSON.stringify(good))
                this.backupGood = JSON.parse(JSON.stringify(this.editGood))
                this.edit = true
                this.dialog = true
            },
            activate () {
                this.active = true
            }
        },
        watch: {
            adding (val) {
                if (val) {
                    this.newGood = {name: '', price: '', changeable_price: false}
                }
            }
        }
    }
</script>
<style scoped>
    .round-corner {
        border-radius: 5px;
    }
</style>
