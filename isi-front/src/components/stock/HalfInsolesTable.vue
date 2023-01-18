<template>
    <v-flex xs12 sm6 md6 justify-center>
        <span class="title">Полустельки</span>
        <v-data-table
                hide-actions
                :items="halfInsolesSizeIds"
                :loading="$store.getters.busy || $store.getters.wsLoading"
                class="elevation-1"
        >
            <template slot="headers" slot-scope="row">
                <tr
                >
                    <td
                            rowspan="2"
                            align="center"
                    >
                        <strong>Полустельки</strong>
                    </td>
                    <td
                            colspan="3"
                            align="center"

                    >
                        <strong>Начало дня</strong>
                    </td>
                    <td
                            colspan="3"
                            align="center"

                    >
                        <strong>Приход</strong>
                    </td>
                    <td
                            colspan="3"
                            align="center"

                    >
                        <strong>Расход</strong>
                    </td>
                    <td
                            colspan="3"
                            align="center"
                    >
                        <strong>Конец дня</strong>
                    </td>
                </tr>
                <tr
                        style="height: 1em"
                >
                    <td align="center"
                        style="border-right: 0"
                    >
                        <span class="mat">Кожа</span>
                    </td>
                    <td align="center"
                        style="border-right: 0; border-left: 0;"
                    >
                        <span class="mat">Санаформ</span>
                    </td>
                    <td align="center"
                        style="border-left: 0"
                    >
                        <span class="mat">Флис</span>
                    </td>
                    <td align="center"
                        style="border-right: 0"
                    >
                        <span class="mat">Кожа</span>
                    </td>
                    <td align="center"
                        style="border-right: 0; border-left: 0;"
                    >
                        <span class="mat">Санаформ</span>
                    </td>
                    <td align="center"
                        style="border-left: 0"
                    >
                        <span class="mat">Флис</span>
                    </td>
                    <td align="center"
                        style="border-right: 0"
                    >
                        <span class="mat">Кожа</span>
                    </td>
                    <td align="center"
                        style="border-right: 0; border-left: 0;"
                    >
                        <span class="mat">Санаформ</span>
                    </td>
                    <td align="center"
                        style="border-left: 0"
                    >
                        <span class="mat">Флис</span>
                    </td>
                    <td align="center"
                        style="border-right: 0"
                    >
                        <span class="mat">Кожа</span>
                    </td>
                    <td align="center"
                        style="border-right: 0; border-left: 0;"
                    >
                        <span class="mat">Санаформ</span>
                    </td>
                    <td align="center"
                        style="border-left: 0"
                    >
                        <span class="mat">Флис</span>
                    </td>
                </tr>
            </template>
            <template v-slot:items="props">
                <tr style="height: 1em">
                    <td align="center"
                        :class="{'mini': mini}"
                        style="border-top: 1px solid rgb(200,200,200); border-left: 1px solid rgb(200,200,200);"
                    >
                        Размер <strong>{{ halfInsolesReserves.find(item => item.size_id === props.item).size.name }}</strong>
                    </td>
                    <td align="center" style="border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{'empty': !reservesCount({sizeId: props.item, typeName: 'Кожа'}) }"
                        >
                            {{ reservesCount({sizeId: props.item, typeName: 'Кожа'}) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0; border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{'empty': !reservesCount({sizeId: props.item, typeName: 'Санаформ'}) }"
                        >
                            {{ reservesCount({sizeId: props.item, typeName: 'Санаформ'}) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{'empty': !reservesCount({sizeId: props.item, typeName: 'Флис'}) }"
                        >
                            {{ reservesCount({sizeId: props.item, typeName: 'Флис'}) }}
                        </span>
                    </td>

                    <td align="center" style="border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented receipt': !!findActionCount('receipt', 'Полустельки', 'Кожа', props.item),
                                'empty': !findActionCount('receipt', 'Полустельки', 'Кожа', props.item)
                            }"
                        >
                            {{ findActionCount('receipt', 'Полустельки', 'Кожа', props.item) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0; border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented receipt': !!findActionCount('receipt', 'Полустельки', 'Санаформ', props.item),
                                'empty': !findActionCount('receipt', 'Полустельки', 'Санаформ', props.item)
                            }"
                        >
                            {{ findActionCount('receipt', 'Полустельки', 'Санаформ', props.item) }}
                        </span>

                    </td>
                    <td align="center" style="border-left: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented receipt': !!findActionCount('receipt', 'Полустельки', 'Флис', props.item),
                                'empty': !findActionCount('receipt', 'Полустельки', 'Флис', props.item)
                            }"
                        >
                            {{ findActionCount('receipt', 'Полустельки', 'Флис', props.item) }}
                        </span>
                    </td>

                    <td align="center" style="border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented expense': !!findActionCount('expense', 'Полустельки', 'Кожа', props.item),
                                'empty': !findActionCount('expense', 'Полустельки', 'Кожа', props.item)
                            }"
                        >
                            {{ findActionCount('expense', 'Полустельки', 'Кожа', props.item) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0; border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented expense': !!findActionCount('expense', 'Полустельки', 'Санаформ', props.item),
                                'empty': !findActionCount('expense', 'Полустельки', 'Санаформ', props.item)
                            }"
                        >
                            {{ findActionCount('expense', 'Полустельки', 'Санаформ', props.item) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented expense': !!findActionCount('expense', 'Полустельки', 'Флис', props.item),
                                'empty': !findActionCount('expense', 'Полустельки', 'Флис', props.item)
                            }"
                        >
                            {{ findActionCount('expense', 'Полустельки', 'Флис', props.item) }}
                        </span>
                    </td>

                    <td align="center" style="border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented': countChanged({sizeId: props.item, typeName: 'Кожа'}),
                                'empty': !countAfter({sizeId: props.item, typeName: 'Кожа'})
                            }"
                        >
                            {{ countAfter({sizeId: props.item, typeName: 'Кожа'}) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0; border-right: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented': countChanged({sizeId: props.item, typeName: 'Санаформ'}),
                                'empty': !countAfter({sizeId: props.item, typeName: 'Санаформ'})
                            }"
                        >
                           {{ countAfter({sizeId: props.item, typeName: 'Санаформ'}) }}
                        </span>
                    </td>
                    <td align="center" style="border-left: 0"
                        :class="{'mini': mini}"
                    >
                        <span
                            :class="{
                                'accented': countChanged({sizeId: props.item, typeName: 'Флис'}),
                                'empty': !countAfter({sizeId: props.item, typeName: 'Флис'})
                            }"
                        >
                            {{ countAfter({sizeId: props.item, typeName: 'Флис'}) }}
                        </span>
                    </td>
                </tr>
            </template>
        </v-data-table>
    </v-flex>

</template>
<script>
    export default {
        name: 'HalfInsolesTable',
        computed: {
            mini () {
                return this.$store.getters.miniMode
            },
            stockActions () {
                return this.$store.state.stock.stockActions
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            halfInsolesSizeIds () {
                return [... new Set(this.halfInsolesReserves.map(item => item.size_id))]
            },
            halfInsolesReserves () {
                return this.reserves.filter(item => item.product.name === 'Полустельки' && !['29-30', '30-31.5', '32-33', '34-34.5', '46-46.5', '47'].includes(item.size.name))
            },
            reserves () {
                return this.$store.state.stock.reserves
            }
        },
        methods: {
            countChanged ({sizeId, typeName}) {
                return this.reservesCount({sizeId: sizeId, typeName: typeName}) !== this.countAfter({sizeId: sizeId, typeName: typeName})
            },
            countAfter ({sizeId, typeName}) {
                return this.reservesCount({sizeId: sizeId, typeName: typeName}) + this.findActionCount('receipt', 'Полустельки', typeName, sizeId) - this.findActionCount('expense', 'Полустельки', typeName, sizeId)
            },
            reservesCount ({sizeId, typeName}) {
                if (this.workingIslandId) {
                    let base = this.halfInsolesReserves.find(item => +item.size_id === +sizeId && item.type.name === typeName)
                    return base && base.count || 0
                }
                return this.halfInsolesReserves
                    .filter(item => +item.size_id === +sizeId && item.type.name === typeName)
                    .reduce((a, b) => a + b.count, 0)
            },
            findActionCount (action, productName, typeName, sizeId) {
                const nameOfType = (type_id) => this.$store.state.stock.options.types && this.$store.state.stock.options.types
                    .find(item => +item.id === +type_id).name
                const add = (a, b) => +a + +b.count
                let currentEntityActions = this.stockActions
                    .filter(item => item.type === action && item.product.name === productName && nameOfType(item.type_id) === typeName && +item.size_id === +sizeId)
                return currentEntityActions.reduce(add, 0) || 0
            }
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
