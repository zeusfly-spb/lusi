<template>
    <v-flex
            v-if="isSuperadmin || isLogist"
    >
        <v-dialog
            v-model="dialog"
            max-width="1000px"
        >
            <template v-slot:activator="{ on }">
                <v-btn color="primary" flat dark class="mb-2"
                       @click="showDialog"
                       :disabled="!workingIslandId"
                >
                    Новая операция
                </v-btn>
            </template>
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="light-blue darken-3"
                >
                    <span class="headline white--text">Новая операция по складу</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <sub>Тип операции</sub>
                                <v-select
                                    v-model="newActionData.type"
                                    :items="actionTypes"
                                    item-text="text"
                                    item-value="type"
                                    single-line
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Наименование</sub>
                                <v-select
                                    v-model="newActionData.product_id"
                                    :items="products"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4
                                    v-if="!isGood"
                            >
                                <sub>Материал</sub>
                                <v-select
                                    v-model="newActionData.type_id"
                                    :items="types"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4
                                    v-if="!isGood"
                            >
                                <sub>Размер</sub>
                                <v-select
                                    v-model="newActionData.size_id"
                                    :items="sizes"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    data-vv-as="Размер"
                                    data-vv-name="size"
                                    :error-messages="!isGood ? errors.collect('size') : ''"
                                    v-validate="!isGood ? 'required' : ''"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Количество</sub>
                                <v-text-field
                                    v-model="newActionData.count"
                                    autofocus
                                    data-vv-as="Количество"
                                    data-vv-name="count"
                                    :error-messages="errors.collect('count')"
                                    v-validate="'required|integer'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Комментарий</sub>
                                <v-text-field
                                    v-model="newActionData.comment"
                                />
                            </v-flex>

                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="dialog = false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="primary darken-1"
                        flat="flat"
                        @click="saveAction"
                        :disabled="!availableAction"
                    >
                        Добавить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'NewStockActionDialog',
        data: () => ({
            newActionData: {},
            dialog: false,
            availableAction: true,
            actionTypes: [
                {text: 'Приход', type: 'receipt'},
                {text: 'Расход', type: 'expense'}
            ]
        }),
        computed: {
            isLogist () {
                return this.$store.getters.logist
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            isGood () {
                return this.currentProduct && this.currentProduct.description === 'good'
            },
            currentProduct () {
                return this.products && this.products.find(item => +item.id === +this.newActionData.product_id)
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            products () {
                return this.$store.state.stock.options.products
            },
            types () {
                return this.$store.state.stock.options.types
            },
            sizes () {
                let currentProduct = this.products && this.products.find(product => product.id === this.newActionData.product_id) || {name: 'Стельки'}
                return currentProduct.name === 'Стельки' ? this.$store.state.stock.options.sizes :
                    this.$store.state.stock.options.sizes.filter(size => !['29-30', '30-31.5', '32-33', '34-34.5', '46-46.5', '47'].includes(size.name))
            },
            defaultActionData () {
                return {
                    type: 'receipt',
                    product_id: this.products && this.products.map(item => item.id)[0] || null,
                    type_id: this.types && this.types.find(item => item.name === 'Кожа').id || null,
                    size_id: this.sizes && this.sizes.map(item => item.id)[0] || null,
                    count: '',
                    comment: ''
                }
            }
        },
        methods: {
            saveAction () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.availableAction = false
                        this.$store.dispatch('addStockAction', this.newActionData)
                            .then(() => [this.dialog, this.availableAction] = [false, true])
                    })
            },
            showDialog () {
                this.newActionData = JSON.parse(JSON.stringify(this.defaultActionData))
                this.dialog = true
            }
        },
        watch: {
            sizes (value) {
                this.newActionData.size_id = value[0].id
            }
        }
    }
</script>
