<template>
    <v-flex>
        <service-deal-updater :deal="deal" v-if="isService"/>
        <div v-if="!isService">
             <span v-if="!active"
                   :class="{clickable: canUpdate && !loading}"
                   @click="activate"
                   :title="canUpdate && !loading && ready ? 'Клик чтобы изменить продукцию по сделке' : ''"
             >
                {{ subscription ? subscription.name : deal.insole.name }}
            </span>
            <span v-else class="grey--text">{{ deal.insole.name }}</span>
        </div>

        <v-dialog
            v-model="active"
            persistent
            max-width="600px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Изменить продукцию по сделке</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm12 md12
                                v-if="isSale"
                            >
                                <v-select
                                        v-model="deal.product_id"
                                        :items="products"
                                        item-text="name"
                                        item-value="id"
                                        single-line
                                        @change="updateCurrentProduct"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4
                                v-else
                            >
                                <sub>Продукция</sub>
                                <v-select
                                    v-model="deal.product_id"
                                    :items="products"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    @change="updateCurrentProduct"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4
                                v-if="!isSale"
                            >
                                <sub>Материал</sub>
                                <v-select
                                    v-model="deal.type_id"
                                    :items="stockOptions.types"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    @change="updateCurrentType"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4
                                v-if="!isSale"
                            >
                                <sub>Размер</sub>
                                <v-select
                                    v-model="deal.size_id"
                                    :items="formattedSizes"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    data-vv-as="Размер"
                                    data-vv-name="size"
                                    :error-messages="errors.collect('size')"
                                    v-validate="'required'"
                                />
                            </v-flex>

                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="deactivate">Закрыть</v-btn>
                    <v-btn color="green darken-1" flat @click="updateDeal">
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </v-flex>
</template>
<script>
    import ServiceDealUpdater from './ServiceDealUpdater'
    export default {
        name: 'DealUpdater',
        props: {
            deal: {
                type: Object,
                required: true
            }
        },
        data: () => ({
            loading: false,
            currentType: null,
            currentProduct: null,
            active: false
        }),
        computed: {
            isCertificate () {
                return this.deal.action_type === 'certificate'
            },
            ready () {
                return [this.products, this.stockOptions.types, this.formattedSizes].every(item => !!item && item.length > 0)
            },
            isSale () {
                return this.deal.action_type === 'sale' || false
            },
            isService () {
                return this.deal && this.deal.is_service || false
            },
            subscription () {
                return this.deal.subscription_id && this.subscriptions.find(item => +item.id === +this.deal.subscription_id) || null
            },
            subscriptions () {
                return this.$store.state.catalog.subscriptions
            },
            products () {
                return this.$store.state.stock.options.products
            },
            types () {
                return this.$store.state.stock.options.types
            },
            sizes () {
                return this.currentProduct && this.currentProduct.name === 'Стельки' ? this.$store.state.stock.options.sizes :
                    this.$store.state.stock.options.sizes && this.$store.state.stock.options.sizes.filter(size => !['29-30', '30-31.5', '32-33', '34-34.5', '46-46.5', '47'].includes(size.name))
            },
            currentReserves () {
                return this.$store.getters.currentReserves
            },
            newDealSizes () {
                let currentProduct = this.stockOptions.products && this.stockOptions.products.find(product => +product.id === +this.deal.product_id) || {name: 'Стельки'}
                return currentProduct.name === 'Стельки' ? this.$store.state.stock.options.sizes :
                    this.$store.state.stock.options.sizes && this.$store.state.stock.options.sizes.filter(size => !['29-30', '31-31.5', '32-33', '34-34.5', '46-46.5', '47'].includes(size.name))
            },
            formattedSizes () {
                const getCurrentAction = () => {
                    if (!this.stockOptions || !this.stockOptions.deal_actions) {
                        return null
                    }
                    return this.stockOptions.deal_actions.find(item => +item.id === +this.deal.deal_action_id).type || null
                }
                let currentAction = getCurrentAction()
                let productName = this.currentProduct && this.currentProduct.name || 'Стельки'
                let typeName = this.currentType && this.currentType.name || 'Кожа'
                return currentAction === 'produce' ? this.sizes &&
                    this.sizes.map(item => this.currentCount(productName, typeName, item.id) > 0 ? item : ({...item, disabled: true})) : this.sizes
            },
            stockOptions () {
                return this.$store.state.stock.options
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            realDate () {
                return this.$store.state.realDate
            },
            canUpdate () {
                if (this.subscription || this.isCertificate) {
                    return false
                }
                return this.isSuperadmin ? true :  this.deal.user_id === this.authUser.id && this.isToday
            },
            basePath () {
                return this.$store.state.basePath
            },
            authUser () {
                return this.$store.state.authUser
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        methods: {
            updateDeal () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('updateDealWithStock', this.deal)
                            .then(() => {
                                this.$store.dispatch('pushMessage', {text: 'Данные продукции сделки изменены'})
                                this.$store.dispatch('setStockActions')
                                this.deactivate()
                            })
                    })
            },
            updateCurrentType () {
                this.currentType = this.types && this.types.find(item => +item.id === +this.deal.type_id)
            },
            updateCurrentProduct () {
                this.currentProduct = this.products && this.products.find(item => +item.id === +this.deal.product_id)
            },
            currentCount (productName, typeName, sizeId) {
                let target = this.currentReserves.find(reserve => reserve.size_id === sizeId && reserve.product.name === productName && reserve.type.name === typeName)
                return target && target.count || 0
            },
            deactivate () {
                this.active = false
            },
            activate () {
                if (!this.canUpdate || this.loading || !this.ready) return
                this.active = true
            }
        },
        watch: {
            formattedSizes (value) {
                this.loading = true
                let enabledSizes = value.filter(item => !item.disabled)
                if (!enabledSizes.length) {
                    // this.deal.size_id = null
                    return
                }
                // this.deal.size_id = enabledSizes[0].id
                this.loading = false
            },
            sizes (value) {
                // this.deal.size_id = value.length && value[0].id
            },
            deal () {
                this.updateCurrentProduct()
                this.updateCurrentType()
            },
            active (value) {
                if (value) {
                    this.$emit('activated')
                }  else {
                    this.$emit('deactivated')
                }
            }
        },
        mounted () {
            this.updateCurrentProduct()
            this.updateCurrentType()
        },
        components: {
            ServiceDealUpdater
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
    }
    .round-corner {
        border-radius: 5px;
    }
</style>
