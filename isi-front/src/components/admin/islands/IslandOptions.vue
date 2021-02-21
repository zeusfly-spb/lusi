<template>
    <v-layout column>
        <v-layout
            justify-center
            :column="extended"
        >
            <call-center-switcher
                v-if="extended"
                :island_id="island.id"
            />
            <v-layout>
                <v-flex
                        v-if="extended"
                >
                    <v-sheet
                        class="p-1 m-1 mb-1 round-corner"
                        elevation="2"
                        color="blue lighten-5"
                    >
                        <span class="text-center body-2 pl-2">
                            Показывать на странице Зарплата
                        </span>
                        <v-radio-group
                            class="pl-2"
                            column
                            v-model="salaryDisplay"
                        >
                            <v-radio
                                    v-for="(item, index) in salaryDisplayOptions"
                                    :key="index"
                                    :label="item.description"
                                    :value="item.value"
                            />
                        </v-radio-group>
                        <div
                                class="teal lighten-5"
                                v-if="salaryDisplay === 'selected'"
                        >
                            <v-checkbox
                                    v-for="user in users"
                                    :key="user.id"
                                    :label="user.full_name"
                                    v-model="user.accepted"
                                    @change="submitUsersList"
                            />
                        </div>
                    </v-sheet>
                </v-flex>
                <v-flex
                    v-if="extended"
                >
                    <v-sheet
                        class="p-1 m-1 mb-1 round-corner"
                        elevation="2"
                        color="yellow lighten-5"
                    >
                        <span
                              class="text-center body-2 pl-2"
                        >
                            Услуги
                        </span>
                        <div
                            class="pb-3 pl-1"
                        >
                            <v-checkbox
                                    height=".5em"
                                    v-for="service in servicesCatalog"
                                    :key="service.id"
                                    :label="service.description"
                                    v-model="service.accepted"
                                    hide-details
                                    @change="submitServiceList"
                            />
                        </div>
                    </v-sheet>

                </v-flex>
                <cabinet-control
                        v-if="extended"
                        :islandId="island.id"
                        @success="deliverSuccess"
                />
            </v-layout>

            <v-layout
                style="margin-top: 1em"
                v-if="extended"
            >
                <island-notify-control
                        :island_id="island.id"
                />
            </v-layout>

            <v-layout
                style="margin-top: 1em"
                v-if="extended"
            >
                <island-salary-options-control
                    :island_id="island.id"
                />
            </v-layout>

            <v-layout
                style="margin-top: 1em"
                v-if="extended"
            >
                <additional-telephony-codes-control
                    :island_id="island.id"
                />
                <island-sites-control
                    :island_id="island.id"
                />
            </v-layout>

        </v-layout>
        <v-layout justify-center>
            <span
                v-if="extended"
                class="caption blue--text clickable mt-2"
                @click="expand"
            >
                Базовые настройки
            </span>
        </v-layout>
    </v-layout>
</template>
<script>
    import CabinetControl from './CabinetControl'
    import IslandNotifyControl from './IslandNotifyControl'
    import CallCenterSwitcher from './CallCenterSwitcher'
    import IslandSalaryOptionsControl from './IslandSalaryOptionsControl'
    import AdditionalTelephonyCodesControl from './AdditionalTelephonyCodesControl'
    import IslandSitesControl from './IslandSitesControl'
    export default {
        name: 'IslandOptions',
        props: ['island', 'extended'],
        data: () => ({
            salaryDisplayOptions: [
                {value: 'attach', description: 'Всех, с доступом к островку'},
                {value: 'time', description: 'С рабочими днями на островке' },
                {value: 'attach_time', description: 'С доступом и рабочими днями'},
                {value: 'selected', description: 'Только выбранных'}
            ]
        }),
        computed: {
            servicesCatalog () {
                let base =  this.$store.state.catalog.services
                return base.map(item => ({... item, accepted: this.islandServiceIds.includes(item.id)}))
            },
            users () {
                let base = this.island && this.island.users
                return base.map(item => ({... item, accepted: this.selectedUserIds.length && this.selectedUserIds.includes(item.id) || false}))
            },
            islandServiceIds: {
                get () {
                    return this.options && this.options.service_ids || []
                },
                set (val) {
                    let result = {... this.options, service_ids: val}
                    this.$emit('change', result)
                }
            },
            options () {
                return this.island && this.island.options
            },
            salaryDisplay: {
                get () {
                    return this.options && this.options.salary_display || 'attach'
                },
                set (val) {
                    let result = {... this.options, salary_display: val}
                    this.$emit('change', result)
                }
            },
            selectedUserIds: {
                get () {
                    return this.options && this.options.selected_user_ids || []
                },
                set (val) {
                    let result = {... this.options, selected_user_ids: val}
                    this.$emit('change', result)
                }
            }
        },
        methods: {
            deliverSuccess (text) {
                this.$emit('message', text)
            },
            submitServiceList () {
                this.islandServiceIds = this.servicesCatalog
                    .filter(item => item.accepted)
                    .map(service => service.id)
            },
            submitUsersList () {
                this.selectedUserIds = this.users.filter(item => item.accepted).map(item => item.id)
            },
            expand () {
                this.$emit('expand')
            }
        },
        mounted () {
            this.$store.dispatch('setCatalogs')
        },
        components: {
            CabinetControl,
            IslandNotifyControl,
            CallCenterSwitcher,
            IslandSalaryOptionsControl,
            AdditionalTelephonyCodesControl,
            IslandSitesControl
        }
    }
</script>
