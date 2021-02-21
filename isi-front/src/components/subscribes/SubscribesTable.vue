<template>
    <v-flex>
        <subscribe-mode-changer/>
        <v-data-table
            :pagination.sync="defSorting"
            v-blur="subscribesLoading"
            :headers="headers"
            :items="subscribes"
            hide-actions
        >
            <template
                v-slot:items="props"
            >
                <subscribe
                    :index="props.index"
                    :subscribe="props.item"
                />
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет оформленных абонементов</span>
            </template>
        </v-data-table>
        <subscribe-comments/>
        <subscribe-events/>
    </v-flex>
</template>
<script>
    import Subscribe from './Subscribe'
    import SubscribeComments from './SubscribeComments'
    import SubscribeEvents from './SubscribeEvents'
    import SubscribeModeChanger from './SubscribesModeChanger'
    export default {
        name: 'SubscribesTable',
        data: () => ({
            defSorting: {'sortBy': 'start_date', 'ascending': false, 'rowsPerPage': -1},
            headers: [
                {text: '#', value: null, sortable: false},
                {text: 'Заказчик', value: 'customer_id'},
                {text: 'Оформил', value: 'user_id'},
                {text: 'Абонемент', value: 'subscription_id'},
                {text: 'Начало периода', value: 'start_date'},
                {text: 'Окончание периода', value: 'finish_date'},
                {text: 'Записи', value: 'rate'},
                {text: 'Комментарии', value: null, sortable: false}
            ]
        }),
        computed: {
            subscribeViewMode () {
                return this.$store.state.subscribes.subscribeViewMode
            },
            subscribesLoading () {
                return this.$store.state.subscribes.subscribesLoading
            },
            subscribes () {
                switch (this.subscribeViewMode) {
                    case null:
                        return this.$store.state.subscribes.subscribes
                    case 'inactive':
                        return this.$store.state.subscribes.inactiveSubscribes
                    case 'all':
                        return this.$store.state.subscribes.allSubscribes
                }
            }
        },
        created () {
            this.$store.dispatch('setSubscribes')
        },
        watch: {
            subscribeViewMode (val) {
                switch (val) {
                    case null:
                        this.$store.dispatch('setSubscribes')
                        break
                    case 'inactive':
                        this.$store.dispatch('setInactiveSubscribes')
                        break
                    case 'all':
                        this.$store.dispatch('setAllSubscribes')
                        break
                }
            }
        },
        components: {
            Subscribe,
            SubscribeComments,
            SubscribeEvents,
            SubscribeModeChanger
        }
    }
</script>

<style scoped>
    tr:hover {
        background-color: transparent !important;
    }
    td:hover {
        background-color: transparent !important;
    }
</style>
