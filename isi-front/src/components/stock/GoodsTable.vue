<template>
    <v-flex xs12 sm6 md6 justify-center>
            <span>
                <span class="title">Товары</span>
                <goods-control/>
            </span>
        <v-data-table
                hide-actions
                :items="goodsProductIds"
                :loading="$store.getters.busy || $store.getters.wsLoading"
                class="elevation-1"
        >
            <template slot="headers" slot-scope="row">
                <tr>
                    <td align="center">
                        <strong>Наименование</strong>
                    </td>
                    <td align="center">
                        <strong>Начало дня</strong>
                    </td>
                    <td align="center">
                        <strong>Приход</strong>
                    </td>
                    <td align="center">
                        <strong>Расход</strong>
                    </td>
                    <td align="center">
                        <strong>Конец дня</strong>
                    </td>
                </tr>
            </template>
            <template v-slot:items="props">
                <tr style="height: 1em">
                    <td align="center"
                        :class="{'mini': mini}"
                    >
                        {{ goodName(props.item) }}
                    </td>
                    <td align="center"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{'empty': !reservesCount(props.item)}"
                        >
                            {{ reservesCount(props.item) }}
                        </span>
                    </td>
                    <td align="center"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented receipt': !!goodActionCount(props.item, 'receipt'),
                                'empty': !goodActionCount(props.item, 'receipt')
                            }"
                        >
                            {{ goodActionCount(props.item, 'receipt') }}
                        </span>
                    </td>
                    <td align="center"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented expense':  !!goodActionCount(props.item, 'expense'),
                                'empty': !goodActionCount(props.item, 'expense')
                            }"
                        >
                            {{ goodActionCount(props.item, 'expense') }}
                        </span>
                    </td>
                    <td align="center"
                        :class="{'mini': mini}"
                    >
                        {{ goodsReserves.find(item => item.product_id === props.item).count + goodActionCount(props.item, 'receipt') - goodActionCount(props.item, 'expense') }}
                    </td>
                </tr>
            </template>
        </v-data-table>
    </v-flex>
</template>
<script>
    import GoodsControl from "./GoodsControl";
    export default {
        name: 'GoodsTable',
        computed: {
            mini () {
                return this.$store.getters.miniMode
            },
            stockActions () {
                return this.$store.state.stock.stockActions
            },
            currentReserves () {
                return this.$store.getters.currentReserves
            },
            goodsProductIds () {
                return [... new Set(this.goodsReserves.map(item => +item.product_id))]
            },
            goodsReserves () {
                return this.currentReserves.filter(item => item.product.description === 'good')
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        methods: {
            reservesCount (productId) {
                let base = this.goodsReserves
                    .find(item => item.product_id === productId)
                return base && base.count || 0
            },
            goodActionCount (productId, action) {
                let actions = this.stockActions.filter(item => +item.product_id === +productId && item.type === action)
                const add = (a, b) => +a + +b.count
                return actions.reduce(add, 0) || 0
            },
            goodName (id) {
                return this.goodsReserves.find(item => +item.product_id === +id).product.name || '*'
            }
        },
        components: {
            GoodsControl
        }
    }
</script>
<style scoped>
    .mini {
        height: 1em!important;
        padding: 0!important;
    }
    table {
        border: solid 1px rgb(200,200,200);
        display: table;
        border-collapse: collapse;
        border-spacing: 2px;
    }
    td {
        border: solid 1px rgb(200,200,200);
        padding-left: .25em!important;
        padding-right: .25em!important;
    }
    .mat {
        color: rgba(0,0,0,0.54);
        font-weight: 500;
        font-size: 12px;
    }
    .clickable {
        opacity: .8;
        cursor: pointer;
    }
    .clickable:hover {
        opacity: 1;
    }
    .accented {
        font-weight: bold;
    }
    .receipt {
        color: #388E3C;
    }
    .expense {
        color: #D32F2F;
    }
    .empty {
        color: #BDBDBD;
    }
</style>
