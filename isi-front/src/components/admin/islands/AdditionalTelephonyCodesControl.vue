<template>
    <v-sheet
        class="p-0 mb-1 round-corner"
        elevation="2"
        :color="color"
    >
        <span
            class="pl-2 text-center body-2"
        >
            Дополнительные коды телефонии
        </span>
        <v-btn
            small
            icon
            title="Добавить код телефонии"
        >
            <v-icon
                color="green"
                @click="addMode = true"
            >
                add
            </v-icon>
        </v-btn>
        <v-data-table
            :items="additionalTelephonyCodes"
            :headers="headers"
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
                    <td>
                        {{ props.item.value }}
                    </td>
                    <td>
                        {{ props.item.description }}
                    </td>
                    <td align="right">
                        <v-btn
                            icon
                            small
                            :title="`Удалить дополнительный код ${props.item.value}`"
                            @click="showDeleteConfirm(props.item)"
                        >
                            <v-icon
                                small
                                color="red"
                            >
                                delete
                            </v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет дополнительных телефонных кодов</span>
            </template>
        </v-data-table>
        <v-dialog
            v-model="addMode"
            max-width="700px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="light-blue darken-3"
                >
                    <v-icon
                        color="white"
                        class="mr-2"
                    >
                        add_ic_call
                    </v-icon>
                    <span
                        class="title white--text"
                    >
                        Добавить телефонный код
                    </span>
                    <v-spacer/>
                    <v-icon
                        class="clickable"
                        color="white"
                        title="Закрыть"
                        @click="addMode = false"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-container
                        grid-list-md
                        class="p-0 m-0"
                    >
                        <v-layout wrap>
                            <v-flex
                                    xs12 sm6 md6
                            >
                                <v-text-field
                                    v-model="newTelCode.value "
                                    label="Код"
                                    data-vv-as="Код"
                                    data-vv-name="code"
                                    :error-messages="errors.collect('code')"
                                    v-validate="'numeric|required|max:3'"
                                    ref="new_val"
                                />
                            </v-flex>
                            <v-flex
                                    xs12 sm6 md6
                            >
                                <v-text-field
                                    v-model="newTelCode.description"
                                    label="Примечание"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="addMode = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="addTelCode">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="deleteConfirm"
            max-width="500px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="red"
                >
                    <span class="title white--text">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    <span class="subheading">
                        Удалить код телефонии <strong>{{ codeToDelete && codeToDelete.value || '' }}</strong>
                        {{ codeToDelete && codeToDelete.description || ''}}?
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="deleteConfirm = false">Отмена</v-btn>
                    <v-btn color="red darken-1" flat @click="deleteTelCode">Удалить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-sheet>
</template>

<script>
    export default {
        name: 'AdditionalTelephonyCodesControl',
        props: {
            island_id: Number
        },
        data: () => ({
            codeToDelete: null,
            newTelCode: {
                value: '',
                description: ''
            },
            addMode: false,
            color: 'teal lighten-5',
            island: null,
            headers: [
                {text: 'Код', value: null, sortable: false},
                {text: 'Примечание', value: null, sortable: false},
                {text: 'Действия', value: null, sortable: false},
            ]
        }),
        computed: {
            deleteConfirm: {
                get () {
                    return !!this.codeToDelete
                },
                set (val) {
                    !val ? this.codeToDelete = null : null
                }
            },
            additionalTelephonyCodes: {
                get () {
                    const value = () => this.island.options.additionalTelephonyCodes || []
                    return this.island && this.island.options && value() || []
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'additionalTelephonyCodes',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            }
        },
        methods: {
            deleteTelCode () {
                let before = this.additionalTelephonyCodes
                this.additionalTelephonyCodes = before.filter(item => item.value !== this.codeToDelete.value)
                this.deleteConfirm = false
            },
            showDeleteConfirm (telCode) {
                this.codeToDelete = telCode
            },
            addTelCode () {
                const exists = telCode => this.additionalTelephonyCodes
                    .map(item => item.value).includes(telCode.value)
                const isMain = telCode => this.island.vpbx_extension === telCode.value
                const action = () => {
                    let before = this.additionalTelephonyCodes
                    before.push(this.newTelCode)
                    this.additionalTelephonyCodes = before
                    this.addMode = false
                }
                if (exists(this.newTelCode)) {
                    this.$store.dispatch('pushMessage', {
                        text: 'Добавляемый код уже присутствует в списке',
                        color: 'red'
                    })
                    this.newTelCode.value = ''
                    this.$refs.new_val.focus()
                    return
                }
                if (isMain(this.newTelCode)) {
                    this.$store.dispatch('pushMessage', {
                        text: 'Добавляемый код является основным',
                        color: 'red'
                    })
                    this.newTelCode.value = ''
                    this.$refs.new_val.focus()
                    return
                }
                this.$validator.validate()
                    .then(res => res ? action() : null)
            },
            setIsland () {
                this.island = this.$store.state.islands.find(item => +item.id === +this.island_id)
            }
        },
        created () {
            this.setIsland()
        },
        watch: {
            addMode (val) {
                !val ? this.newTelCode = {value: '', description: ''} : null
            }
        }
    }
</script>

<style scoped>

</style>
