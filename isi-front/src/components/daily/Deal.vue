<template>
    <tr
        :class="{total: isTotal}"
        :style="{backgroundColor: `${serviceColor}!important`}"
    >
        <td
            :class="{'mini': mini}"
            v-if="isTotal"
            colspan="6"
            align="right"
        >
            <span
                class="medium"
                :class="{'mr-1': mini}"
            >
                <strong>ИТОГО:</strong>
            </span>
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >

            <v-icon
                :small="mini"
                class="red--text delete"
                :title="`Удалить сделку ${deal.insole.name} на ${deal.income}р.`"
                @click="confirmToDelete"
                v-if="canUpdate"
            >
                clear
            </v-icon>
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >
            {{ deal.number }}
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >
            <user-avatar
                class="clickable"
                v-if="!editMode.user"
                :user="deal.user"
                :mini="mini"
                @click="switchEditMode('user')"
            />
            <v-select
                v-if="editMode.user"
                autofocus
                :items="users"
                v-model="deal.user_id"
                height="1em"
                style="width: 25em"
                item-text="full_name"
                item-value="id"
                single-line
                @focus="focused('user')"
                @blur="blur('user')"
                @change="updateDeal('user')"
            />
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >
            <customer-updater
                :mini="mini"
                :deal="deal"
              @new="newCustomer = true"
            />
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >
            {{ deal.action && deal.action.text || '' }}
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >
            <span>
                <deal-updater
                    :deal="deal"
                    @activated="focused"
                    @deactivated="blur('insole')"
                />
            </span>
        </td>
        <td
                :class="{'mini': mini}"
        >
            <span
                v-if="isTotal"
                :class="{'ml-1': mini}"
            >
                {{ totalDealIncome | pretty }}
            </span>
            <price-updater
                v-else
                :deal="deal"
                mode="income"
            />
        </td>
        <td
                :class="{'mini': mini}"
        >
            <span
                v-if="isTotal"
            >
                {{ totalDealExpense | pretty }}
            </span>
            <price-updater
                v-else
                :deal="deal"
                mode="expense"
            />
        </td>
        <td v-if="!isTotal"
            :class="{'mini': mini}"
        >
            <deal-payment-updater :deal="deal"/>
        </td>
        <new-customer-dialog
            :active="newCustomer"
            @cancel="cancelNewCustomer"
            @added="setNewCustomer"
        />
    </tr>
</template>
<script>
    import NewCustomerDialog from './NewCustomerDialog'
    import DealUpdater from './DealUpdater'
    import CustomerUpdater from './CustomerUpdater'
    import PriceUpdater from './PriceUpdater'
    import UserAvatar from "../main/UserAvatar"
    import DealPaymentUpdater from './DealPaymentUpdater'

    export default {
        name: 'Deal',
        props: ['deal'],
        data: () => ({
            newCustomer: false,
            selectedCustomerId: null,
            paymentTypes: [
                {value: true, text: 'Наличный'},
                {value: false, text: 'Безналичный'}
            ],
            editMode: {
                income: false,
                expense: false,
                is_cache: false,
                insole: false,
                customer: false,
                user: false
            }
        }),
        computed: {
            isAdmin () {
                return this.$store.state.authUser.is_admin
            },
            serviceItem () {
                if (!this.deal.is_service && ['produce', 'correction', 'prodDefect', 'islandDefect', 'alteration', 'return'].includes(this.deal.action_type)) {
                    return this.$store.getters.allServices.length
                        && this.$store.getters.allServices.find(item => item.description === 'Стельки') || null
                }
                return this.$store.getters.allServices.find(item => +item.id === +this.deal.service_id) || null
            },
            serviceColor () {
                return this.serviceItem && this.serviceItem.highlight && this.$store.getters.colorValue(this.serviceItem.highlight) || ''
            },
            islandServices () {
                const value = () => this.$store.getters.allServices.filter(item => item.description !== 'Стельки')
                return this.$store.getters.allServices.lengththis.$store.getters.workingIsland && value() || []
            },
            mini () {
                return this.$store.getters.miniMode
            },
            totalDealExpense () {
                return this.$store.getters.totalDealExpense
            },
            totalDealIncome () {
                return this.$store.getters.totalDealIncome
            },
            isTotal () {
                return this.deal.id === null
            },
            users () {
                let base = this.$store.state.users.filter(item => !item.fired_at)
                if (this.isAdmin) {
                    let currentWorkingUserIds = this.$store.state.workdays
                        .filter(item => !item.time_finish)
                        .map(wd => +wd.user_id)
                    return base.filter(user => currentWorkingUserIds.includes(+user.id))
                }
                return base.map(user => ({...user, full_name: user.is_superadmin ? 'Суперадмин' : user.full_name }))
            },
            customers () {
                return [
                    {id: null, full_name: 'Аноним'},
                    {id: 0, full_name: 'Новый клиент'},
                    ...this.$store.state.customers
                ]
            },
            insoles () {
                return this.$store.state.insoles
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            realDate () {
                return this.$store.state.realDate
            },
            canUpdate () {
                if (this.isTotal) {
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
            setNewCustomer (customer) {
                this.newCustomer = false
                this.selectedCustomerId = this.deal.customer_id = customer.id
                this.$store.dispatch('updateDealCustomerId', {
                    deal_id: this.deal.id,
                    customer_id: customer.id
                })
                    .then(() => {
                        this.blur()
                        this.$store.dispatch('pushMessage', {
                            text: 'Значение "Клиент" изменено',
                            color: 'green'
                        })
                    })
            },
            cancelNewCustomer () {
                this.newCustomer = false
            },
            customerSelected () {
               switch (this.selectedCustomerId) {
                   case 0:
                       this.newCustomer = true
                       break
                   default:
                       this.deal.customer_id = this.selectedCustomerId
                       this.$store.dispatch('updateDeal', this.deal)
                           .then(() => {
                               this.blur('customer')
                               this.$emit('snack', 'Значение "Клиент" изменено', 'green')
                           })
                       break
               }
            },
            confirmToDelete () {
                this.$emit('delete', this.deal)
            },
            updateDeal (mode) {
                this.$validator.validate()
                    .then(valid => {
                        if (!valid) return
                        this.$store.dispatch('updateDeal', mode === 'user' ? {id: this.deal.id, user_id: this.deal.user_id} :this.deal)
                            .then(() => this.blur(mode))
                    })
            },
            blur (mode) {
                this.editMode[mode] = false
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, deals: true})
            },
            focused () {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, deals: false})
            },
            switchEditMode (mode) {
                if (!this.canUpdate && !this.isAdmin) return
                if (this.isAdmin && !this.isToday) return
                for(let key in this.editMode) {
                    this.editMode[key] = false
                }
                this.editMode[mode] = true
            }
        },
        created () {
            this.selectedCustomerId = this.deal.customer_id
        },
        components: {
            NewCustomerDialog,
            DealUpdater,
            CustomerUpdater,
            PriceUpdater,
            UserAvatar,
            DealPaymentUpdater
        }
    }
</script>
<style scoped>
    .mini {
        height: 1em!important;
        padding: 0!important;
    }
    .clickable {
        cursor: pointer;
    }
    .delete {
        cursor: pointer;
        opacity: .6;
    }
    .delete:hover {
        opacity: 1;
    }
    .total {
        border-top:solid 2px rgb(200,200,200);
    }
</style>
