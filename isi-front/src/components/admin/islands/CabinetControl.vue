<template>
    <v-flex class="m-0 p-0">
        <v-sheet
            class="p-1 m-1 mb-1 round-corner"
            elevation="2"
            color="lime lighten-5"
        >
            <span
                    class="text-center body-2 pl-2"
            >
            Кабинеты
        </span>
            <div
                    class="p-0 m-0"
            >
                <v-btn color="primary"
                       flat
                       dark
                       small
                       @click="openAddDialog"
                >
                    Добавить кабинет
                </v-btn>
            </div>
            <v-data-table
                    :items="cabinets"
                    hide-headers
                    hide-actions
            >
                <template v-slot:items="props">
                    <tr
                        style="height: 1em!important;"
                        :style="{backgroundColor: `${$store.getters.colorValue('lime lighten-5')}!important`}"
                    >
                        <td>{{ props.index + 1 }}</td>
                        <td>{{ props.item.name }}</td>
                        <td>{{ props.item.description }}</td>
                        <td
                                align="right"
                                style="margin: 0; padding: 0"
                        >
                            <v-btn flat small icon
                                   title="Редактировать"
                            >
                                <v-icon
                                        small
                                        color="green"
                                        @click="openEditDialog(props.item)"
                                >
                                    edit
                                </v-icon>
                            </v-btn>
                            <v-btn flat small icon
                                   @click="showDeleteConfirm(props.item)"
                                   title="Удалить"
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
                <span class="red--text">
                    У островка отсутствуют кабинеты
                </span>
                </template>
            </v-data-table>
        </v-sheet>

        <v-dialog
            :value="!!dialog"
            max-width="800px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">
                        {{ `${ {add: 'Добавить', edit: 'Редактировать'}[dialog]} кабинет на остров${{add: 'ок', edit: 'ке'}[dialog]} "${island.name}"` }}
                    </span>
                    <v-spacer/>
                     <v-icon
                         class="clickable"
                         @click="closeDialog"
                         color="white"
                         title="Закрыть"
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
                            <v-flex xs12 sm6 md6>
                                <v-text-field
                                    v-if="!!dialog"
                                    v-model="editedCabinet.name"
                                    label="Название"
                                    data-vv-as="Название"
                                    data-vv-name="name"
                                    :error-messages="errors.collect('name')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md6>
                                <v-text-field
                                    v-model="editedCabinet.description"
                                    label="Описание"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn
                        flat="flat"
                        @click="closeDialog"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        :disabled="loading"
                        color="green darken-1"
                        flat="flat"
                        @click="saveCabinet"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="confirm"
            max-width="500px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Подтвержение</span>
                </v-card-title>
                <v-card-text>
                    <span class="subheading">
                        Удалить кабинет <strong>"{{ cabinetToDelete && cabinetToDelete.name }}"</strong>
                        островка <strong>"{{ island && island.name }}"</strong>?
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn
                        flat
                        @click="confirm=false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="red darken-1"
                        flat
                        @click="deleteCabinet"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <cabinet-prompt
            :island="island"
            :prompt="prompt"
            :to-delete="cabinetToDelete"
            @action="promptAction"
            @cancel="promptCancel"
        />
    </v-flex>
</template>
<script>
    import CabinetPrompt from './CabinetPrompt'
    export default {
        name: 'CabinetControl',
        props: ['islandId'],
        data: () => ({
            prompt: null,
            loading: false,
            currentAction: null,
            cabinetToDelete: null,
            confirm: false,
            dialog: null,
            editedCabinet: null,
            blankCabinet: {
                name: null,
                description: null
            }
        }),
        computed: {
            islandEvents () {
                let base = this.$store.state.appointment.appointments || []
                return base.filter(item => +item.island_id === +this.islandId)
            },
            cabinetsCount () {
                return this.cabinets.length
            },
            island () {
                return this.$store.state.islands.find(island => +island.id === +this.islandId)
            },
            options () {
                return this.island && this.island.options
            },
            cabinets: {
                get () {
                    return this.island && this.island.cabinets || []
                },
                set (val) {
                    let updatedOptions = {... this.options, cabinets: val}
                    this.loading = true
                    this.$store.dispatch('updateIsland', {...this.island, options: updatedOptions})
                        .then(() => {
                            let targetCabinet
                            switch (this.currentAction) {
                                case 'add': targetCabinet = this.editedCabinet
                                    break
                                case 'edit': targetCabinet = this.editedCabinet
                                    break
                                case 'delete': targetCabinet = this.cabinetToDelete
                                    break
                            }
                            let successText = `Кабинет "${targetCabinet.name}" ${{add: 'добавлен', delete: 'удален', edit: 'изменен'}[this.currentAction]} в островке "${this.island.name}"`
                            this.$store.dispatch('pushMessage', {
                                text: successText,
                                color: 'green'
                            })
                            this.closeDialog()
                        })
                        .finally(() => this.loading = false)
                }
            }
        },
        methods: {
            promptCancel (mode) {
                this.prompt = null
            },
            promptAction (mode) {
                switch (mode) {
                    case 'first':
                        this.editedCabinet = JSON.parse(JSON.stringify(this.blankCabinet))
                        this.currentAction = 'add'
                        this.openDialog('add')
                        break
                    case 'last':
                        this.confirm = true
                        break
                    default: break
                }
            },
            performPostAction: async function ({old, now}) {
                console.log(old, now)
                let baseMessage = `В островке "${this.island.name}" `
                let firstMessage = baseMessage + 'добавлен первый кабинет, и все существующие записи назначены на него'
                let lastMessage = baseMessage + 'удален последний кабинет и все его записи получили статус "без кабинета"'
                let postAction = old === 0 && now > 0 ? 'first' : old > 0 && now === 0 ? 'last' : old > now ? 'reduce': null
                console.log(postAction)
                if (postAction) {
                    let storeAction = {first: 'firstCabinetCreated', last: 'cabinetsReduced', reduce: 'cabinetsReduced'}[postAction]
                    let result = await this.$store.dispatch(storeAction, this.islandId)
                    console.dir(result)
                    switch (result.mode) {
                        case 'error':
                            this.$store.dispatch('pushMessage', {
                                text: `Произошла непредвиденная ошибка, количество кабинетов: ${result.count}`,
                                color: 'red'
                            })
                            break
                        case 'first':
                            this.$store.dispatch('pushMessage', {
                                text: `${firstMessage} (${result.count})`,
                                color: 'blue'
                            })
                            break
                        case 'last':
                            this.$store.dispatch('pushMessage', {
                                text: `${lastMessage} (${result.count})`,
                                color: 'blue'
                            })
                            break
                        case 'middle':
                            this.$store.dispatch('pushMessage', {
                                text: `Записи (${result.count}) прежде назначенные на уделенный кабинет, были переоформлены на кабинет добавленный позже остальных.`,
                                color: 'blue'
                            })
                            break
                        default: break
                    }
                }
            },
            openEditDialog (cabinet) {
                this.editedCabinet = JSON.parse(JSON.stringify(cabinet))
                this.currentAction = 'edit'
                this.openDialog('edit')
            },
            deleteCabinet () {
                this.currentAction = 'delete'
                let cabinets = this.cabinets
                cabinets = cabinets.filter(item => item.id !== this.cabinetToDelete.id)
                this.cabinets = cabinets
                this.confirm = false
            },
            showDeleteConfirm (cabinet) {
                if (this.cabinetsCount === 1 && this.islandEvents.length) {
                    this.cabinetToDelete = cabinet
                    this.prompt = 'last'
                    return
                }
                this.cabinetToDelete = cabinet
                this.confirm = true
            },
            saveCabinet () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        let cabinets = this.cabinets
                        switch (this.currentAction) {
                            case 'add':
                                cabinets.push({
                                    id: this.$store.state.appointment.uniqID('cab'),
                                    ... this.editedCabinet
                                })
                                break
                            case 'edit':
                                cabinets = cabinets.map(cabinet => cabinet.id === this.editedCabinet.id ? this.editedCabinet : cabinet)
                                break
                        }
                        this.cabinets = cabinets
                    })
            },
            openAddDialog () {
                if (!this.cabinetsCount && this.islandEvents.length) {
                    this.prompt = 'first'
                    return
                }
                this.editedCabinet = JSON.parse(JSON.stringify(this.blankCabinet))
                this.currentAction = 'add'
                this.openDialog('add')
            },
            openDialog (mode) {
                this.dialog = mode
            },
            closeDialog () {
                this.prompt = null
                this.currentAction = null
                this.dialog = null
            }
        },
        created () {
            this.editedCabinet = JSON.parse(JSON.stringify(this.blankCabinet))
        },
        components: {
            CabinetPrompt
        }
    }
</script>
