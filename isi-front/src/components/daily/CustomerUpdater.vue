<template>
    <span>
        <span
            v-if="!active"
        >
            <v-icon
                :small="mini"
                v-if="!anonymous"
                style="user-select: none"
                color="green"
                title="Показать историю взаимодействия"
                @click="showInteractions"
            >
                contacts
            </v-icon>
            <span
                v-if="deal.customer"
                :title="canUpdate ? 'Чтобы изменить клиента - клик мышкой' : ''"
                :class="{clickable: canUpdate}"
                @click="canUpdate ? active = true : null"
            >
                {{ deal.customer && deal.customer.full_name || '' }}
            </span>
            <span v-else>
                Аноним
            </span>
             <interactions-card
                 no-activator
                 v-model="interactionsOpen"
                 :customer="customer"
                 @extendCustomer="extendCustomer"
             />
        </span>
        <v-select
                v-if="active"
                autofocus
                :items="customers"
                v-model="selectedCustomerId"
                height="1em"
                style="width: 25em"
                item-text="full_name"
                item-value="id"
                single-line
                @focus="focused"
                @blur="blur"
                @change="customerSelected"
        >
            <template v-slot:item="data">
                <span :class="{'red--text': data.item.id === null, 'green--text': data.item.id === 0}">
                    {{ data.item.full_name }}
                </span>
            </template>
        </v-select>
    </span>
</template>
<script>
    import InteractionsCard from '../customers/InteractionsCard'
    export default {
        name: 'CustomerUpdater',
        props: {
            deal: Object,
            mini: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            extendedCustomer: null,
            interactionsOpen: false,
            active: false,
            selectedCustomerId: null
        }),
        computed: {
            anonymous () {
                return this.deal && !this.deal.customer_id
            },
            customer () {
                return this.extendedCustomer || this.deal && this.deal.customer || null
            },
            realDate () {
                return this.$store.state.realDate
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            isTotal () {
                return this.deal.id === null
            },
            authUser () {
                return this.$store.state.authUser
            },
            canUpdate () {
                if (this.isTotal ||  !this.deal.product || this.deal.product.description === 'subscription') {
                    return false
                }
                return this.isSuperadmin ? true :  this.deal.user_id === this.authUser.id && this.isToday
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            customers () {
                return [
                    {id: null, full_name: 'Аноним'},
                    {id: 0, full_name: 'Новый клиент'},
                    ...this.$store.state.customers
                ]
            },
            visible: {
                get () {
                    return this.value
                },
                set (val) {
                    this.$emit('input', val)
                }
            }
        },
        methods: {
            extendCustomer (data) {
                this.extendedCustomer = data
            },
            showInteractions () {
                this.interactionsOpen = true
            },
            customerSelected () {
                switch (this.selectedCustomerId) {
                    case 0:
                        this.$emit('new')
                        break
                    default:
                        this.$store.dispatch('updateDealCustomerId', {
                            deal_id: this.deal.id,
                            customer_id: this.selectedCustomerId
                        })
                            .then(() => {
                                this.blur()
                                this.$store.dispatch('pushMessage', {
                                    text: 'Значение "Клиент" изменено',
                                    color: 'green'
                                })
                            })
                        break
                }
            },
            blur () {
                this.hide()
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, deals: true})
            },
            focused () {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, deals: false})
            },
            show () {
                this.active = true
            },
            hide () {
                this.active = false
            }
        },
        components: {
            InteractionsCard
        }
    }
</script>
<style scoped>
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
