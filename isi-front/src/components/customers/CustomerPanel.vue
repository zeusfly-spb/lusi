<template>
    <v-flex align-center>
        <div class="mb-2">
             <v-btn color="primary" flat dark class="mb-2" @click="showAddDialog">Добавить клиента</v-btn>
             <v-text-field
                 class="right"
                 style="width: 23em"
                 v-model="searchString"
                 append-icon="search"
                 label="Начните вводить данные для поиска..."
                 single-line
                 hide-details
                 @input="lazyQuerySelection"
             />
        </div>
        <v-dialog persistent
                  v-model="dialog"
                  max-width="600px"
                  @update:returnValue="closeDialog"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">{{ {add: 'Добавить', edit: 'Редактировать'}[mode] }} клиента</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.last_name"
                                    label="Фамилия"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.first_name"
                                    label="Имя"
                                    data-vv-as="Имя"
                                    data-vv-name="first-name"
                                    :error-messages="errors.collect('first-name')"
                                    v-validate="'required'"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.patronymic"
                                    label="Отчество"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
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
                                        <v-text-field
                                            :label="editedCustomer.birth_date | moment('DD MMMM YYYY г.')"
                                            prepend-icon="event"
                                            readonly
                                            v-on="on"
                                        />
                                    </template>
                                    <v-date-picker
                                        v-model="date"
                                        no-title
                                        scrollable
                                        @change="datePicked"
                                    />
                                </v-menu>
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.address"
                                    label="Адрес"
                                />
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-if="mode === 'add'"
                                    v-model="editedCustomer.phone"
                                    label="Телефон"
                                    data-vv-as="Номер телефона"
                                    data-vv-name="phone"
                                    :error-messages="errors.collect('phone')"
                                    v-validate="mode === 'add' ? 'required|digits:10' : null"
                                    mask="(###) ### - ####"
                                />
                                <customer-phones-editor
                                    v-if="mode === 'edit'"
                                    :customer="editedCustomer"
                                    @addOn="addPhoneEnabled = true"
                                    @addOff="addPhoneEnabled = false"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedCustomer.email"
                                    label="Электронная почта"
                                    data-vv-as="Адрес электронной почты"
                                    data-vv-name="email"
                                    :error-messages="errors.collect('email')"
                                    v-validate="'email'"
                                />
                            </v-flex>

                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="dialog = false">Закрыть</v-btn>
                    <v-btn color="green darken-1" flat @click="submitForm" :disabled="addPhoneEnabled">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-data-table
            :headers="headers"
            :items="customers"
            hide-actions
            :search="searchString"
        >
            <template v-slot:items="props">
                    <td
                        :class="{'mini': mini}"
                    >
                        <span>{{ props.item. id }}</span>
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <span>{{ props.item.last_name }}</span>
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <v-icon
                            :small="mini"
                            color="green"
                            @click="showInteractions(props.item.id)"
                            :title="`Показать историю взаимодействия с клиентом ${props.item.full_name}`"
                        >
                            contacts
                        </v-icon>
                        {{ props.item.first_name }}
                        <interactions-card
                            no-activator
                            :customer="props.item"
                            v-if="+interactionsOpenId === +props.item.id"
                            @close="interactionsOpenId = null"
                        />
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <span>{{ props.item.patronymic }}</span>
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <span>{{ props.item.birth_date | moment('DD MMMM YYYY г.') }}</span>
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <span>{{ props.item.address }}</span>
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <customer-phones-column :phones="props.item.phones"/>
                    </td>
                    <td
                        :class="{'mini': mini}"
                    >
                        <span>{{ props.item.email | email }}</span>
                    </td>
                    <td
                        class="justify-center layout px-0"
                        :class="{'mini': mini}"
                    >
                        <v-icon
                            small
                            class="mr-2 green--text"
                            @click="showEditDialog(props.item)"
                            title="Редактировать"
                        >
                            edit
                        </v-icon>
                        <v-icon
                            class="red--text"
                            small
                            @click="showDeleteConfirm(props.item)"
                            title="Удалить"
                        >
                            delete
                        </v-icon>
                    </td>

            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет записей</span>
            </template>
        </v-data-table>

        <v-dialog v-model="confirm"
                  max-width="500"
        >
            <v-card>
                <v-card-title class="subheading">
                    {{ confirmText }}
                </v-card-title>
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
                        @click="deleteCustomer"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>

    </v-flex>
</template>
<script>
    import CustomerPhonesColumn from './CustomerPhonesColumn'
    import CustomerPhonesEditor from './CustomerPhonesEditor'
    import InteractionsCard from './InteractionsCard'
    import Lodash from 'lodash'

    export default {
        name: 'CustomersControl',
        data: () => ({
            interactionsOpenId: null,
            loadedCustomers: [],
            searchString: '',
            customerToDelete: null,
            confirmText: '',
            confirm: false,
            addPhoneEnabled: false,
            date: '',
            menu: false,
            dialog: false,
            mode: null,
            editedCustomer: null,
            defaultCustomer: {
                first_name: '',
                last_name: '',
                patronymic: '',
                address: '',
                birth_date: '',
                phone: '',
                email: ''
            },
            headers: [
                {text: '#', value: 'id'},
                {text: 'Фамилия', value: 'last_name'},
                {text: 'Имя', value: 'first_name'},
                {text: 'Отчество', value: 'patronymic'},
                {text: 'Дата рождения', value: 'birth_date'},
                {text: 'Адрес', value: 'address'},
                {text: 'Телефоны', value: null},
                {text: 'Электронная почта', value: null},
                {text: 'Действия', value: null, align: 'center'}
            ]
        }),
        computed: {
            mini () {
                return this.$store.getters.miniMode
            },
            customersChanged () {
                return this.$store.state.layout.customersChanged
            },
            customers () {
                const excludeExists = (arr) => {
                    let existsIds = this.$store.state.customers.map(item => item.id)
                    let result = []
                    arr.forEach(item => existsIds.includes(item.id) ? null : result.push(item))
                    return result
                }
                return [...this.$store.state.customers, ...excludeExists(this.loadedCustomers)]
            },
            lazyQuerySelection () {
                return Lodash.debounce(this.querySelection, 300)
            }
        },
        methods:{
            updateSelection () {
                this.querySelection()
                this.$store.commit('SET_CUSTOMERS_CHANGED', false)
            },
            showInteractions (id) {
                this.interactionsOpenId = id
            },
            querySelection () {
                if (!this.searchString.length) {
                    this.loadedCustomers = []
                    return
                }
                this.$store.commit('ADD_TASK', 'customers')
                this.axios.post('/api/search_customer_by_text', {text: this.searchString})
                    .then(res =>this.loadedCustomers = res.data)
                    .finally(() => this.$store.commit('REMOVE_TASK', 'customers'))
            },
            deleteCustomer () {
                this.$store.dispatch('deleteCustomer', this.customerToDelete.id)
                    .then(() => {
                        this.confirm = false
                        const text = `Клиент ${this.customerToDelete.full_name} удален`
                        this.$store.dispatch('pushMessage', {text})
                        this.querySelection()
                    })
            },
            showDeleteConfirm (customer) {
                this.confirmText = `Удалить данные о клиенте ${customer.full_name}?`
                this.customerToDelete = customer
                this.confirm = true
            },
            closeDialog () {
                this.mode = null
            },
            showEditDialog (customer) {
                this.mode = 'edit'
                this.editedCustomer = JSON.parse(JSON.stringify(customer))
                this.dialog = true
            },
            submitForm () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        let action = this.mode === 'add' ? 'addCustomer' : 'updateCustomer'
                        this.$store.dispatch(action, this.editedCustomer)
                            .then((res) => {
                                if (res.data.exists) {
                                    const message = {text: 'Клиент с таким номером телефона уже присутствует в базе! Проверьте правильность ввода или повторите поиск.', color: 'red'}
                                    this.$store.dispatch('pushMessage', message)
                                    return
                                }
                                this.dialog = false
                                const text = `${this.mode === 'add' ? 'Добавлен новый клиент' : 'Данные клиента изменены'}`
                                this.$store.dispatch('pushMessage', {text})
                                this.querySelection()
                            })
                    })
            },
            datePicked (date) {
                this.editedCustomer.birth_date = new Date(date).toISOString().split('T')[0]
                this.menu = false
            },
            showAddDialog () {
                this.mode = 'add'
                this.editedCustomer = JSON.parse(JSON.stringify(this.defaultCustomer))
                this.dialog = true
            }
        },
        created () {
            this.editedCustomer = JSON.parse(JSON.stringify(this.defaultCustomer))
        },
        watch: {
            customersChanged (val) {
                val ? this.updateSelection() : null
            },
            searchString (val) {
                if (!val.length) {
                    this.loadedCustomers = []
                }
            }
        },
        components: {
            CustomerPhonesColumn,
            CustomerPhonesEditor,
            InteractionsCard
        }
    }
</script>
<style scoped>
    .mini {
        height: 1em!important;
        padding: 0!important;
        margin: 0!important;
    }
    .round-corner {
        border-radius: 5px;
    }
</style>
