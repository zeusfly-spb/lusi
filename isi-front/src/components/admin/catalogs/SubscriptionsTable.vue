<template>
    <v-data-table
        :headers="headers"
        :items="subscriptions"
        hide-actions
    >
        <template v-slot:items="props">
            <tr>
                <td>
                    {{ props.index + 1 }}
                </td>
                <td>
                    {{ props.item.name | upFirst }}
                </td>
                <td>
                    {{ props.item.service.description || props.item.service_id }}
                </td>
                <td
                    align="center"
                >
                    {{ props.item.number_days }}
                </td>
                <td
                    align="center"
                >
                    {{ props.item.supply_amount }}
                </td>
                <td
                    align="center"
                >
                    {{ props.item.base_price }}
                </td>
                <td
                    align="right"
                >
                    <v-icon
                        v-if="props.item.changeable_price"
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
                        color="blue"
                        class="clickable"
                        title="Редактировать абонемент"
                        @click="edit(props.item)"
                    >
                        edit
                    </v-icon>
                    <v-icon
                        small
                        color="red"
                        class="clickable"
                        title="Удалить абонемент"
                        @click="confirmDelete(props.item)"
                    >
                        delete
                    </v-icon>
                </td>
            </tr>
        </template>
        <template v-slot:no-data>
            <span class="red--text">Нет абонементов</span>
        </template>
    </v-data-table>
</template>

<script>
    export default {
        name: 'SubscriptionsTable',
        data: () => ({
            headers: [
                {text: '#', value: null},
                {text: 'Абонемент', value: 'name'},
                {text: 'Услуга', value: 'service_id'},
                {text: 'Срок действия (дн.)', value: 'number_days'},
                {text: 'Количество приемов', value: 'supply_amount'},
                {text: 'Цена', value: 'base_price'},
                {text: 'Изменяемая цена', sortable: false, value: 'changeable_price'},
                {text: 'Действия', sortable: false, align: 'right', value: null}
            ]
        }),
        computed: {
            subscriptions () {
                return this.$store.state.catalog.subscriptions
            }
        },
        methods: {
            edit (subscription) {
                this.$store.commit('SET_SUBSCRIPTION_TO_EDIT', subscription)
            },
            confirmDelete (subscription) {
                this.$store.commit('SET_SUBSCRIPTION_TO_DELETE', subscription)
            }
        }
    }
</script>

<style scoped>

</style>
