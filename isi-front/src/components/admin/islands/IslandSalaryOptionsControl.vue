<template>
    <v-sheet
        class="p-0 mb-1 round-corner"
        elevation="2"
        :color="color"
    >
         <span
                 class="pl-2 text-center body-2"
         >
            Правила расчета зарплаты
        </span>
        <v-data-table
            :headers="headers"
            :items="tableItems"
            hide-actions
        >
            <template v-slot:headers="{ headers }">
                <tr
                    :style="{backgroundColor: `${$store.getters.colorValue(color)}!important`}"
                >
                    <th
                        v-for="(header, index) in headers"
                        :key="index"
                    >
                        {{ header.text }}
                    </th>
                </tr>
            </template>
            <template v-slot:items="props">
                <tr
                    :style="{backgroundColor: `${$store.getters.colorValue(color)}!important`}"
                >
                    <td>{{ props.item.role }}</td>
                    <td
                        align="center"
                    >
                        <div
                            class="checkbox-field"
                        >
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'admin'"
                                    v-model="adminDealsIncome"
                            />
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'spec'"
                                    v-model="specDealsIncome"
                            />
                        </div>
                    </td>
                    <td
                        align="center"
                    >
                        <div
                            class="checkbox-field"
                        >
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'admin'"
                                    v-model="adminAppointmentsCount"
                            />
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'spec'"
                                    v-model="specAppointmentsCount"
                            />
                        </div>
                    </td>
                    <td
                            align="center"
                    >
                        <div
                                class="checkbox-field"
                        >
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'admin'"
                                    v-model="adminSalesIncomeCount"
                            />
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'spec'"
                                    v-model="specSalesIncomeCount"
                            />
                        </div>
                    </td>
                    <td
                            align="center"
                    >
                        <div
                                class="checkbox-field"
                        >
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'admin'"
                                    v-model="adminServiceIncomeCount"
                            />
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'spec'"
                                    v-model="specServiceIncomeCount"
                            />
                        </div>
                    </td>
                    <td
                            align="center"
                    >
                        <div
                                class="checkbox-field"
                        >
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'admin'"
                                    v-model="adminSubServiceIncomeCount"
                            />
                            <v-checkbox
                                    class="mt-3"
                                    v-if="props.item.purpose === 'spec'"
                                    v-model="specSubServiceIncomeCount"
                            />
                        </div>
                    </td>
                </tr>
            </template>
        </v-data-table>

    </v-sheet>

</template>

<script>
    export default {
        name: 'IslandSalaryOptionsControl',
        props: {
            island_id: Number
        },
        data: () => ({
            color: 'lime lighten-5',
            island: null,
            headers: [
                {text: 'Роль', value: null, sortable: false},
                {text: 'Оборот по всем сделкам', value: null, sortable: false},
                {text: 'Количество завершенных записей', value: null, sortable: false},
                {text: 'Оборот по продажам', value: null, sortable: false},
                {text: 'Оборот по услугам', value: null, sortable: false},
                {text: 'Оборот по доп. услугам', value: null, sortable: false},
            ]
        }),
        computed: {
            specSubServiceIncomeCount: {
                get () {
                    const value = () => this.island.options.specSubServiceIncomeCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'specSubServiceIncomeCount',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            adminSubServiceIncomeCount: {
                get () {
                    const value = () => this.island.options.adminSubServiceIncomeCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'adminSubServiceIncomeCount',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            specServiceIncomeCount: {
                get () {
                    const value = () => this.island.options.specServiceIncomeCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'specServiceIncomeCount',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            adminServiceIncomeCount: {
                get () {
                    const value = () => this.island.options.adminServiceIncomeCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'adminServiceIncomeCount',
                        value: val
                    })
                        .finally(() => this.setIsland())

                }
            },
            specSalesIncomeCount: {
                get () {
                    const value = () => this.island.options.specSalesIncomeCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'specSalesIncomeCount',
                        value: val
                    })
                        .finally(() => this.setIsland())

                }
            },
            adminSalesIncomeCount: {
                get () {
                    const value = () => this.island.options.adminSalesIncomeCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'adminSalesIncomeCount',
                        value: val
                    })
                        .finally(() => this.setIsland())

                }
            },
            specAppointmentsCount: {
                get () {
                    const value = () => this.island.options.specAppointmentsCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'specAppointmentsCount',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            adminAppointmentsCount: {
                get () {
                    const value = () => this.island.options.adminAppointmentsCount || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'adminAppointmentsCount',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            adminDealsIncome: {
                get () {
                    const value = () => this.island.options.adminDealsIncome || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'adminDealsIncome',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            specDealsIncome: {
                get () {
                    const value = () => this.island.options.specDealsIncome || false
                    return this.island && this.island.options && value() || false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'specDealsIncome',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            },
            tableItems () {
                const adminRow = () => ({
                    role: 'Администраторы',
                    purpose: 'admin',
                    deals_income: this.adminDealsIncome,
                    appointment_count: this.adminAppointmentsCount
                })
                const specRow = () => ({
                    role: 'Специалисты',
                    purpose: 'spec',
                    deals_income: this.specDealsIncome,
                    appointment_count: this.specAppointmentsCount
                })
                return [adminRow(), specRow()]
            }
        },
        methods: {
            setIsland () {
                this.island = this.$store.state.islands.find(item => +item.id === +this.island_id)
            }
        },
        created () {
            this.setIsland()
        }
    }
</script>

<style scoped>
    .options-td {
        margin-left: auto;
        margin-right: auto;
        margin-top: auto;
        margin-bottom: auto;
    }
    .checkbox-field {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .option-layout {
        margin-top: 0!important;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .option-label {
        padding-right: 1em;
        color: rgba(0, 0, 0, 0.54);
    }
</style>
