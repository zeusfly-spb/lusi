<template>
    <v-flex>
        <v-data-table
            :headers="headers"
            :items="actions"
            hide-actions
            class="elevation-1"
        >
            <template v-slot:items="props">
                <td
                    :class="{'mini': mini}"
                >
                    {{ props.index + 1 }}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ props.item.type === 'receipt' ? 'Приход' : 'Расход'}}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ props.item.product.name }}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ !!props.item.product.description ? '' : typeName(props.item.type_id) }}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ !!props.item.product.description ? '' : props.item.size.name }}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ props.item.count }}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ props.item.user.full_name }}
                </td>
                <td
                    :class="{'mini': mini}"
                >
                    {{ props.item.comment || ' - '}}
                </td>
            </template>

            <template v-slot:no-data>
                <span class="red--text">Нет операций по складу</span>
            </template>
        </v-data-table>
    </v-flex>
</template>
<script>
    export default {
        name: 'StockActionsTable',
        data: () => ({
            headers: [
                {text: '#', value: 'id'},
                {text: 'Операция', value: 'type'},
                {text: 'Продукция', value: 'product.name'},
                {text: 'Материал', value: 'type_id'},
                {text: 'Размер', value: 'size.name'},
                {text: 'Количество', value: 'count'},
                {text: 'Инициатор', value: 'user.full_name'},
                {text: 'Комментарий', value: 'comment'}
            ]
        }),
        computed: {
            mini () {
                return this.$store.getters.miniMode
            },
            types () {
                return this.$store.state.stock.options.types
            },
            actions () {
                return this.$store.state.stock.stockActions
            }
        },
        methods: {
            typeName (typeId) {
                return this.types && this.types.find(item => +item.id === +typeId).name || ''
            }
        }
    }
</script>
<style scoped>
    .mini {
        height: 1em!important;
        padding: 0!important;
    }
</style>
