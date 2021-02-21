<template>
    <span>
        <span
                :title="canUpdate ? 'Чтобы изменить форму оплаты - клик мышкой' : ''"
                :class="{clickable: canUpdate}"
                @click="edit = true"
        >
            <span
                v-if="!edit"
            >
                {{ deal.is_cache ? 'Наличный' : 'Безналичный' }}
            </span>
            <v-select
                    v-else
                    style="width: 3em"
                    autofocus
                    height="1em"
                    v-model="deal.is_cache"
                    :items="paymentTypes"
                    item-text="text"
                    item-value="value"
                    single-line
                    @blur="edit = false"
                    @change="update"
            />
        </span>
    </span>

</template>

<script>
    export default {
        name: 'DealPaymentUpdater',
        props: {deal: Object},
        data: () => ({
            edit: false,
            paymentTypes: [
                {value: true, text: 'Наличный'},
                {value: false, text: 'Безналичный'}
            ]
        }),
        computed: {
            realDate () {
                return this.$store.state.realDate
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            canUpdate () {
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
            update () {
                this.$store.dispatch('updateDealPaymentType', {
                    deal_id: this.deal.id,
                    is_cache: this.deal.is_cache
                })
                this.edit = false
            }
        }
    }
</script>

<style scoped>

</style>
