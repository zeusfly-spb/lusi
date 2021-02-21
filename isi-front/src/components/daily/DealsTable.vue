<template>
    <v-flex>
        <v-snackbar
            v-model="snackbar"
            auto-height
            top
            :timeout="3000"
            :color="snackColor"
        >
            <span>{{ snackText }}</span>
        </v-snackbar>

        <v-data-table
                v-blur="loading"
                :loading="loading"
                :headers="headers"
                :items="deals"
                hide-actions
                class="elevation-1"
        >
            <template v-slot:items="props">
                <tr
                    is="deal"
                    :deal="{...props.item, number: props.index + 1}"
                    @snack="showSnack"
                    @delete="deleteConfirm"
                />
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет сделок</span>
            </template>
        </v-data-table>

        <v-dialog v-model="dialog" max-width="900px"
                  @update:returnValue="newCustomer = false"
        >
            <template v-slot:activator="{ on }">
                <v-btn color="primary" flat dark class="mb-2" @click="showDialog"
                       :disabled="$store.state.workingIslandId === 0 || !isToday || isLogist"
                >
                    Новая сделка
                </v-btn>
            </template>
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Новая сделка</span>
                </v-card-title>
                <v-progress-linear
                    :indeterminate="true"
                    style="margin: 0 auto"
                    v-if="loadingUsers"
                />
                <v-card-text
                    style="padding-top: 0"
                >
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm12 md12>
                                <sub>Клиент</sub>
                                <v-autocomplete
                                        label="Начните вводить данные для поиска..."
                                        :search-input.sync="search"
                                        v-model="selectedCustomerId"
                                        :items="customers"
                                        item-text="full_name"
                                        item-value="id"
                                        single-line
                                        data-vv-name="customer"
                                        data-vv-as="Клиент"
                                >
                                    <template v-slot:item="data">
                                        <span :class="{'red--text': data.item.id === null, 'green--text': data.item.id === 0}">
                                            {{ data.item.full_name }}
                                        </span>
                                    </template>
                                    <template slot="no-data">
                                        <span class="red--text">Нет совпадений по запросу</span>
                                    </template>
                                </v-autocomplete>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Действие</sub>
                                <v-select
                                    v-model="newDealData.deal_action_id"
                                    :items="actions"
                                    item-text="text"
                                    item-value="id"
                                    single-line
                                    data-vv-name="action"
                                    data-vv-as="Действие"
                                    :error-message="errors.collect('action')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <template
                                    v-if="certificate"
                            >
                                <v-flex xs12 sm6 md4>
                                    <sub>Начало периода</sub>
                                    <v-menu
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            lazy
                                            transition="scale-transition"
                                            offset-y
                                            full-width
                                            min-width="290px"
                                            v-model="certMenu"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <div
                                                    class="date-input"
                                            >
                                                <v-text-field
                                                        :label="newCertificateStartDate | moment('D MMMM YYYY г.')"
                                                        prepend-inner-icon="event"
                                                        readonly
                                                        v-on="on"
                                                >
                                                    <template
                                                            slot="label"
                                                    >
                                                        <span>
                                                            {{ newCertificateStartDate | moment('D MMMM YYYY г.') }}
                                                        </span>
                                                    </template>
                                                </v-text-field>
                                            </div>
                                        </template>
                                        <v-date-picker
                                                v-model="newCertificateStartDate" no-title scrollable
                                                @change="certDatePicked"
                                                locale="ru"
                                                first-day-of-week="1"
                                        />
                                    </v-menu>
                                </v-flex>
                                <v-flex xs12 sm6 md4>
                                    <sub>Срок действия (дн.)</sub>
                                    <v-text-field
                                            type="number"
                                            v-model="newCertificateDuration"
                                            data-vv-as="Дней"
                                            data-vv-name="new-cert-duration"
                                            :error-messages="errors.collect('new-cert-duration')"
                                            v-validate="'required|greaterThanZero'"
                                    />
                                </v-flex>
                            </template>
                            <template
                                v-if="service"
                            >
                                <v-flex
                                    xs12 sm6 md4
                                >
                                    <sub>Наименование</sub>
                                    <v-select
                                        v-model="selectedServiceId"
                                        :items="islandServices"
                                        item-text="description"
                                        item-value="id"
                                        single-line
                                        data-vv-name="service"
                                        data-vv-as="Наименование"
                                        :error-message="errors.collect('service')"
                                        v-validate="'required'"
                                    />

                                </v-flex>
                            </template>
                            <template
                                v-if="subscribe"
                            >
                                <v-flex
                                    xs12 sm6 md4
                                >
                                    <sub>Тип абонемента</sub>
                                    <v-select
                                        v-model="selectedSubscriptionId"
                                        :items="subscriptions"
                                        item-text="name"
                                        item-value="id"
                                        single-line
                                        data-vv-name="subscription"
                                        data-vv-as="Абонемент"
                                        :error-message="errors.collect('subscription')"
                                        v-validate="subscribe ? 'required' : ''"
                                    />
                                </v-flex>
                                <v-flex
                                    xs12 sm6 md4
                                >
                                    <sub>Дата начала</sub>
                                    <v-menu
                                        :close-on-content-click="false"
                                        :nudge-right="40"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px"
                                        v-model="menu"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <div
                                                class="date-input"
                                            >
                                                <v-text-field
                                                    :label="newSubscribeStartDate | moment('D MMMM YYYY г.')"
                                                    prepend-inner-icon="event"
                                                    readonly
                                                    v-on="on"
                                                >
                                                    <template
                                                        slot="label"
                                                    >
                                                        <span>
                                                            {{ newSubscribeStartDate | moment('D MMMM YYYY г.') }}
                                                        </span>
                                                    </template>
                                                </v-text-field>
                                            </div>
                                        </template>
                                        <v-date-picker
                                            v-model="newSubscribeStartDate" no-title scrollable
                                            @change="datePicked"
                                            locale="ru"
                                            first-day-of-week="1"
                                        />
                                    </v-menu>
                                </v-flex>
                            </template>

                            <v-flex xs12 sm6 md4
                                    v-show="!subscribe && !service && !certificate"
                            >
                                <sub>Продукция</sub>
                                <v-select
                                    v-model="newDealData.product_id"
                                    :items="newDealActionType === 'sale' ? goods : products"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    data-vv-name="product"
                                    data-vv-as="Продукция"
                                    :error-messages="errors.collect('product')"
                                    v-validate="subscribe ? '' : 'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4
                                    v-show="newDealActionType !== 'sale' && !subscribe && !service && !certificate"
                            >
                                <sub>Материал</sub>
                                <v-select
                                    v-model="newDealData.type_id"
                                    :items="stockOptions.types"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4
                                    v-show="newDealActionType !== 'sale' && !subscribe && !service && !certificate"
                            >
                                <sub>Размер</sub>
                                <v-select
                                    v-model="newDealData.size_id"
                                    :items="formattedSizes"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    data-vv-as="Размер"
                                    data-vv-name="size"
                                    :error-messages="newDealActionType !== 'sale' ? errors.collect('size') : ''"
                                    v-validate="!['sale', 'subscribe'].includes(newDealActionType) ? 'required' : ''"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Сумма{{ certificate ? '/Номинал' : ''}}</sub>
                                <v-text-field
                                    :disabled="incomeDisabled"
                                    :readonly="incomeReadonly"
                                    v-model="newDealIncome"
                                    data-vv-name="price"
                                    data-vv-as="Сумма"
                                    :error-messages="errors.collect('price')"
                                    v-validate="incomeValidate"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Форма оплаты</sub>
                                <v-select
                                    :disabled="['prodDefect', 'islandDefect', 'correction', 'alteration'].includes(newDealActionType)"
                                    :items="paymentTypes"
                                    v-model="selectedPaymentType"
                                    item-text="text"
                                    item-value="value"
                                    single-line
                                />
                            </v-flex>

                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" flat @click="dialog = false">Отмена</v-btn>
                    <v-btn color="green darken-1"
                           flat
                           @click="createDeal"
                           :disabled="loadingUsers"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <new-customer-dialog
            :active="newCustomer"
            @cancel="cancelNewCustomer"
            @added="setNewCustomer"
        />

        <v-dialog v-model="confirm"
                  max-width="800"
        >
            <v-card class="round-corner">
                <v-card-title class="subheading light-blue darken-3">
                    <span class="title white--text">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    <span class="title">{{ confirmText }}</span>
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
                        @click="deleteDeal"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </v-flex>
</template>
<script>
    import NewCustomerDialog from './NewCustomerDialog'
    import Deal from './Deal'
    export default {
        name: 'DealsTable',
        data: () => ({
            certMenu: false,
            newCertificateDuration: 0,
            newCertificateStartDate: null,
            selectedServiceId: null,
            menu: false,
            newSubscribeStartDate: null,
            selectedSubscriptionId: null,
            loadingUsers: false,
            pendingRequest: false,
            newDealData: {
                deal_action_id: null,
                product_id: null,
                type_id: null,
                size_id: null
            },
            dealToDelete: null,
            confirm: false,
            confirmText: '',
            newCustomer: false,
            newDealIncome: null,
            selectedPaymentType: true,
            paymentTypes: [
                {value: true, text: 'Наличный'},
                {value: false, text: 'Безналичный'}
            ],
            selectedInsoleId: null,
            search: null,
            loadedCustomers: [],
            snackbar: false,
            snackColor: 'green',
            snackText: '',
            selectedCustomerId: -1,
            dialog: false,
            headers: [
                {text: '', value: null, sortable: false},
                {text: '#', value: 'number', sortable: false},
                {text: 'Сотрудник', value: 'id', sortable: false},
                {text: 'Клиент', value: 'customer_id', sortable: false},
                {text: 'Действие', value: 'action_type', sortable: false},
                {text: 'Продукция / Услуга', value: 'insole', sortable: false},
                {text: 'Приход', value: 'income', sortable: false},
                {text: 'Расход', value: 'expense', sortable: false},
                {text: 'Форма оплаты', value: 'is_cache', sortable: false},
            ]
        }),
        computed: {
            certificate () {
                return this.newDealActionType === 'certificate'
            },
            isLogist () {
                return this.$store.getters.logist
            },
            loading () {
                return this.$store.getters.busy || this.$store.getters.wsLoading
            },
            selectedService () {
                return this.islandServices.find(item => +item.id === +this.selectedServiceId) || null
            },
            islandServices () {
                const value = () => this.$store.getters.workingIsland.services.filter(item => item.description !== 'Стельки')
                return this.$store.getters.workingIsland && this.$store.getters.workingIsland.services && value() || []
            },
            service () {
                return this.newDealActionType === 'service'
            },
            selectedSubscription () {
                return this.subscriptions && this.selectedSubscriptionId && this.subscriptions
                    .find(item => +item.id === +this.selectedSubscriptionId)  || null
            },
            subscriptions () {
                return this.$store.state.catalog.subscriptions
            },
            incomeReadonly () {
                return this.newDealActionType === 'sale' && !this.newDealProduct.changeable_price ||
                    this.newDealActionType === 'subscribe' && !this.selectedSubscription.changeable_price
            },
            incomeDisabled () {
                return ['prodDefect', 'islandDefect', 'correction', 'alteration'].includes(this.newDealActionType)
            },
            incomeValidate () {
                if (this.certificate) {
                    return 'required|integer'
                }
                if (this.newDealActionType === 'service') {
                    return 'required|integer'
                }
                return ['produce', 'return', 'subscribe'].includes(this.newDealActionType)
                    || this.newDealProduct && this.newDealProduct.changeable_price ? 'required|integer' : null
            },
            subscribe () {
                return this.newDealActionType === 'subscribe'
            },
            stockActions () {
                return this.$store.state.stock.stockActions
            },
            actions () {
                function sortAction (a, b) {
                    if (a.type === 'produce' && b.type === 'sale') {
                        return -1
                    }
                    if (a.type === 'sale' && b.type === 'produce') {
                        return 1
                    }
                    if (a.type === 'produce' && b.type !== 'sale') {
                        return -1
                    }
                    if (a.type === 'sale' && b.type !== 'sale') {
                        return -1
                    }
                    return a.id - b.id
                }
                return this.stockOptions.deal_actions && JSON.parse(JSON.stringify(this.stockOptions.deal_actions))
                    .sort(sortAction)
                    .map(item => item.type === 'subscribe' && !this.subscriptions.length ? {...item, disabled: true} : item)
            },
            goods () {
                const markLack = (goodsArray) => goodsArray.map(item => ({...item, count: this.goodCount(item.id), disabled: this.goodCount(item.id) < 1}))
                let result =  this.stockOptions.products && this.stockOptions.products.filter(item => item.description === 'good') || []
                return markLack(result)
            },
            products () {
                return this.stockOptions.products && this.stockOptions.products.filter(item => item.description === null) || []
            },
            formattedSizes () {
                let currentAction = this.stockOptions.deal_actions &&
                    this.stockOptions.deal_actions.find(item => +item.id === +this.newDealData.deal_action_id) &&
                    this.stockOptions.deal_actions.find(item => +item.id === +this.newDealData.deal_action_id).type || null
                let productName = this.stockOptions.products &&
                    this.stockOptions.products.find(item => +item.id === +this.newDealData.product_id) &&
                    this.stockOptions.products.find(item => +item.id === +this.newDealData.product_id).name || null
                let typeName = this.stockOptions.types &&
                    this.stockOptions.types.find(item => +item.id === +this.newDealData.type_id) &&
                    this.stockOptions.types.find(item => +item.id === +this.newDealData.type_id).name || null
                return currentAction === 'produce' ? this.newDealSizes &&
                    this.newDealSizes
                        .map(item => this.currentCount(productName, typeName, item.id) > 0 ? item : ({...item, disabled: true})) : this.newDealSizes
            },
            currentReserves () {
                return this.$store.getters.currentReserves
            },
            newDealProduct () {
                let products = this.stockOptions.products || []
                return products && products.find(item => +item.id === +this.newDealData.product_id) || null
            },
            newDealActionType () {
                let actions = this.$store.state.stock.options.deal_actions || []
                return actions
                    .find(item => +item.id === +this.newDealData.deal_action_id) &&  actions.find(item => +item.id === +this.newDealData.deal_action_id).type || null
            },
            newDealSizes () {
                let currentProduct = this.stockOptions.products && this.stockOptions.products.find(product => product.id === this.newDealData.product_id) || {name: 'Стельки'}
                return currentProduct.name === 'Стельки' ? this.$store.state.stock.options.sizes :
                    this.$store.state.stock.options.sizes.filter(size => !['29-30', '31-31.5', '32-33', '34-34.5', '46-46.5', '47'].includes(size.name))
            },
            stockOptions () {
                return JSON.parse(JSON.stringify(this.$store.state.stock.options))
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
            basePath () {
                return this.$store.state.basePath
            },
            authUser () {
                return this.$store.state.authUser
            },
            insoles () {
                return this.$store.state.insoles
            },
            isDayOpen () {
                return this.$store.getters.isDayOpen
            },
            customers () {
                const extendByNumbers = (customer) => {
                    let phones = ''
                    if (customer.phones && customer.phones.length) {
                        customer.phones.forEach((item, index) => {
                            phones = phones + `${index === 0 ? '' : ', '}${item.number}`
                        })
                    }
                    customer.full_name += ` телефон${customer.phones && customer.phones.length > 1 ? 'ы' : ''}: ` + phones
                    return customer
                }

                return [
                    ...this.loadedCustomers.map(item => extendByNumbers(item)),
                    {id: null, full_name: 'Аноним'},
                    {id: 0, full_name: 'Новый клиент'},
                ]
            },
            deals () {
                if (!this.$store.state.deals.length) {
                    return []
                }
                return [... this.$store.state.deals, {id: null, income: 200}]
            }
        },
        methods: {
            clearLoadedCustomers () {
                this.loadedCustomers = []
            },
            setSubscriptionPrice () {
                if (this.selectedSubscription) {
                    this.newDealIncome = this.selectedSubscription.base_price
                }
            },
            certDatePicked (date) {
                this.newCertificateStartDate = date
                this.certMenu = false
            },
            datePicked (date) {
                this.newSubscribeStartDate = date
                this.menu = false
            },
            setSubscriptionProduct () {
                let subscriptionProduct = this.stockOptions.products && this.stockOptions.products.find(item => item.description === 'subscription') || null
                this.newDealData.product_id = subscriptionProduct && subscriptionProduct.id || 0
            },
            setSubscribeStartToday () {
                this.newSubscribeStartDate = this.$store.state.realDate || null
            },
            setFirstSubscription () {
                this.selectedSubscriptionId = this.subscriptions[0].id || null
            },
            goodCount (productId) {
                let target = this.currentReserves.find(item => +item.product_id === +productId)
                let initialCount = target && target.count || 0
                let targetActions = this.stockActions.filter(item => +item.product_id === +productId)
                const calculate = (a, b) => b.type === 'receipt' ? a + b.count : a - b.count
                return targetActions.reduce(calculate, initialCount)
            },
            currentCount (productName, typeName, sizeId) {
                let target = this.currentReserves
                    .find(reserve => reserve.size_id === sizeId && reserve.product.name === productName && reserve.type.name === typeName)
                return target && target.count || 0
            },
            setDefaultDealData () {
                this.selectedServiceId = this.islandServices && this.islandServices.length && this.islandServices[0].id || null
                this.newDealData.deal_action_id = this.stockOptions.deal_actions && this.stockOptions.deal_actions[0] && this.stockOptions.deal_actions[0].id || null
                this.newDealData.product_id = this.stockOptions.products && this.stockOptions.products[0] && this.stockOptions.products[0].id || null
                this.newDealData.type_id = this.stockOptions && this.stockOptions.types && this.stockOptions.types.find(type => type.name === 'Кожа').id
            },
            deleteDeal () {
                this.$store.dispatch('deleteDeal', this.dealToDelete)
                    .then(() => {
                        this.confirm = false
                        this.showSnack(`Сделка ${this.dealToDelete.insole.name} на ${this.dealToDelete.income}р. удалена`, 'green')
                    })
            },
            deleteConfirm (deal) {
                this.dealToDelete = deal
                if (deal.is_service) {
                    this.confirmText = `Удалить запись о сделке "${deal.service.description || ''}" на ${deal.income}р. ?`
                } else {
                    this.confirmText = `Удалить запись о сделке "${deal.insole.name}" на ${deal.income}р. ?`
                }
                this.confirm = true
            },
            setNewCustomer (customer) {
                this.newCustomer = false
                this.loadedCustomers.push(customer)
                this.selectedCustomerId = customer.id
            },
            cancelNewCustomer () {
                this.selectedCustomerId = -1
                this.newCustomer = false
            },
            createDeal () {
                if ((!this.selectedCustomerId || this.selectedCustomerId < 0) && (this.subscribe || this.certificate)) {
                    let text = `${this.certificate ? 'Сертификат' : this.subscribe ? 'Абонемент' : ''} не может быть оформлен на анонимного клиента!`
                    this.$store.dispatch('pushMessage', {
                        text,
                        color: 'red'
                    })
                    return
                }
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.pendingRequest = true
                        this.$store.dispatch('addDeal', {
                            ...this.newDealData,
                            user_id: this.authUser.id,
                            island_id: this.$store.state.workingIslandId,
                            customer_id: this.selectedCustomerId === -1 ? null : this.selectedCustomerId,
                            income: this.newDealIncome,
                            expense: 0,
                            is_cache: this.selectedPaymentType,
                            subscription_id: this.subscribe ? this.selectedSubscriptionId : null,
                            start_date: this.newSubscribeStartDate,
                            cert_start_date: this.newCertificateStartDate,
                            cert_duration: this.newCertificateDuration,
                            service_id: this.newDealActionType === 'service' ? this.selectedServiceId : null
                        })
                            .then(() => this.dialog = false)
                    })
            },
            querySelection (text) {
                this.clearLoadedCustomers()
                if (!text || !text.length) {
                    return
                }
                this.loadingUsers = true
                this.axios.post('/api/search_customer_by_text', {text: text})
                    .then(res => {
                        this.loadedCustomers = res.data
                    })
                    .catch(e => console.error(e))
                    .finally(() => this.loadingUsers = false)
            },
            showSnack (text, color) {
                this.snackText = text
                this.snackColor = color
                this.snackbar = true
            },
            showDialog () {
                if (!this.isDayOpen && !this.isSuperadmin) {
                    this.showSnack('Чтобы совершить сделку, начните рабочий день', 'red')
                    return
                }
                this.setDefaultDealData()
                this.selectedCustomerId = -1
                this.selectedInsoleId = null
                this.newDealIncome = this.newDealActionType === 'subscribe' ? this.selectedSubscription.base_price : null
                this.dialog = true
            },
            resetValidator () {
                this.$validator.pause()
                this.$nextTick(() => {
                    this.$validator.errors.clear()
                    this.$validator.fields.items.forEach(field => field.reset())
                    this.$validator.fields.items.forEach(field => this.errors.remove(field))
                    this.$validator.resume()
                })

            }
        },
        created () {
            this.$store.dispatch('setCatalogs')
            this.$validator.extend(
                'greaterThanZero',{
                    getMessage: field =>  field + ' должно быть больше 0',
                    validate: (value) => !!value
                });
        },
        watch: {
            certificate (val) {
                this.newCertificateStartDate = val ? this.$store.state.realDate : null
                this.newCertificateDuration = 0
            },
            dialog (val) {
                this.resetValidator()
                if (!val) {
                    return
                }
                switch (this.newDealActionType) {
                    case 'sale':
                        let availableGood = this.goods.filter(item => !item.disabled)[0]
                        this.newDealData.product_id = availableGood && availableGood.id || null
                        break
                    case 'subscribe':
                        this.setSubscriptionProduct()
                        this.setSubscribeStartToday()
                        this.setSubscriptionPrice()
                        break
                    default:
                        this.newDealData.product_id = this.products[0] && this.products[0].id
                        break
                }
            },
            'newDealData.deal_action_id': function () {
                this.resetValidator()
            },
            selectedSubscriptionId (val) {
                if (!val) {
                    return
                }
                if (this.newDealActionType === 'subscribe') {
                    this.newDealIncome = this.selectedSubscription.base_price
                }
            },
            subscriptions (val) {
                val.length ? this.setFirstSubscription() : null
            },
            newDealActionType (value) {
                switch (value) {
                    case 'sale':
                        let availableGood = this.goods.filter(item => !item.disabled)[0]
                        this.newDealData.product_id = availableGood && availableGood.id || null
                        break
                    case 'subscribe':
                        this.setSubscriptionProduct()
                        this.setSubscribeStartToday()
                        this.setSubscriptionPrice()
                        break
                    default:
                        this.newDealData.product_id = this.products[0].id
                        break
                }
            },
            formattedSizes (value) {
                let available = value.filter(item => !item.disabled)
                return this.newDealData.size_id = available.length && available[0].id || null
            },
            selectedCustomerId (val) {
                if (val === 0) {
                    this.newCustomer = true
                }
            },
            search (val) {
                if (this.selectedCustomerId > 0) {
                    return
                }
                if (!val || !val.length) {
                    this.clearLoadedCustomers()
                }
                val && val !== this.select && this.querySelection(val)
            },
            newDealProduct (value) {
                if (!value || !value.description) return
                switch (value.description) {
                    case 'good':
                        this.newDealIncome = value.price
                        break
                    case 'subscription':
                        break
                    default:
                        this.newDealIncome = null
                        break
                }
            }
        },
        components: {
            NewCustomerDialog,
            Deal
        }
    }
</script>
<style scoped>
    .round-corner {
        border-radius: 5px;
    }
</style>
