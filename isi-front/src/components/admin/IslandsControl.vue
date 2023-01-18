<template>
    <v-flex align-center>
        <v-snackbar
                v-model="snackbar"
                auto-height
                top
                :timeout="3000"
                :color="snackColor"
        >
            <span>{{ snackText }}</span>
        </v-snackbar>

       <v-data-table
               :headers="headers"
               :items="islands"
               hide-actions
               class="elevation-1"
       >
           <template v-slot:items="props">
               <td>{{ props.item.id }}</td>
               <td>{{ props.item.name }}</td>
               <td>{{ props.item.description }}</td>
               <td>
                   <island-vpbx-changer :island="props.item" @updated="showSuccess"/>
               </td>
               <td>
                   <island-users-column :island="props.item" @success="showSuccess"/>
               </td>
               <chief-updater :island="props.item" @updated="showSuccess"/>
               <td align="center" style="text-align: center">
                   <div>
                       <v-btn icon
                              @click="showEditDialog(props.item)"
                              title="Редактировать"
                       >
                           <v-icon
                               small
                               color="green"
                           >
                               edit
                           </v-icon>
                       </v-btn>
                       <v-btn icon
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
                   </div>

               </td>
           </template>

           <template v-slot:no-data>
               <span class="red--text">Нет островков</span>
           </template>
       </v-data-table>

        <v-dialog
            v-model="dialog"
            max-width="2000px"
            :persistent="editedIsland.id === extended"
        >
            <template v-slot:activator="{ on }">
                <v-btn flat color="primary" dark class="mb-2" @click="showAddDialog">
                    Добавить островок
                </v-btn>
            </template>
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="light-blue darken-3"
                >
                    <v-icon
                            color="white"
                            class="mr-2"
                            v-if="extendMode"
                    >
                        settings_applications
                    </v-icon>
                    <v-icon
                            color="white"
                            class="mr-2"
                            v-else
                    >
                        settings
                    </v-icon>

                    <span
                        v-if="!extendMode"
                        class="title white--text"
                    >
                        {{ {add: 'Добавить', edit: 'Редактировать'}[mode] }} островок
                    </span>
                    <span
                        v-else
                        class="title white--text"
                    >
                        Расширенные настройки островка {{ editedIsland.name }}
                    </span>
                    <v-spacer/>
                    <v-icon
                            class="clickable"
                            @click="dialog = false"
                            color="white"
                            title="Закрыть"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md
                                 class="p-0 m-0"
                    >
                        <v-layout wrap
                                  v-show="!extendMode"
                        >
                            <v-flex xs12 sm6 md6>
                                <v-text-field
                                    v-model="editedIsland.name"
                                    label="Название"
                                    data-vv-as="Название"
                                    data-vv-name="name"
                                    :error-messages="errors.collect('name')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md6>
                                <v-text-field
                                    v-model="editedIsland.description"
                                    label="Описание"
                                />
                            </v-flex>
                        </v-layout>
                        <v-layout
                            v-if="editedIsland.id"
                            justify-center
                        >
                            <v-spacer v-if="extended !== editedIsland.id"/>
                            <span
                                v-if="extended !== editedIsland.id"
                                class="caption blue--text clickable"
                                @click="extendOptions"
                                style="text-align: center"
                            >
                                Расширенные настройки
                            </span>
                            <island-options
                                :island="editedIsland"
                                :extended="editedIsland.id === extended"
                                @expand="expandOptions"
                                @change="setOptions"
                                @message="showSuccess"
                            />
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="darken-1"
                        flat
                        @click="dialog = false"
                    >
                        Закрыть
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        flat
                        @click="submitForm"
                        :disabled="!changed && mode==='edit'"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="confirm"
                  max-width="400"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="title  light-blue darken-3 white--text">
                    {{ confirmText }}
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                            flat="flat"
                            @click="confirm = false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                            color="red darken-1"
                            flat="flat"
                            @click="deleteIsland"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>

<script>
    import IslandUsersColumn from './islands/IslandUsersColumn'
    import ChiefUpdater from './islands/ChiefUpdater'
    import IslandVpbxChanger from './islands/IslandVpbxChanger'
    import IslandOptions from './islands/IslandOptions'
    export default {
        name: 'IslandsControl',
        data: () => ({
            islandBackup: null,
            extended: null,
            islandToDelete: null,
            confirm: false,
            confirmText: '',
            mode: null,
            dialog: false,
            snackbar: false,
            snackColor: 'green',
            snackText: '',
            editedIsland: null,
            defaultIsland: {
                name: '',
                description: ''
            },
            headers: [
                {text: '#', value: 'id'},
                {text: 'Название', value: 'name'},
                {text: 'Описание', value: 'description'},
                {text: 'Код манго', value: 'vpbx_extension'},
                {text: 'Сотрудники', value: 'users'},
                {text: 'Руководитель', value: 'chief_id'},
                {text: 'Действия', align: 'center', value: null}
            ]
        }),
        computed: {
            changed () {
                return !this.islandBackup ? false : this.islandBackup !== JSON.stringify(this.editedIsland)
            },
            extendMode () {
                return this.editedIsland.id && this.editedIsland.id === this.extended
            },
            islands () {
                return this.$store.state.islands
            }
        },
        methods: {
            setOptions (val) {
                this.editedIsland.options = val
            },
            expandOptions () {
                this.extended = null
            },
            extendOptions () {
                this.editedIsland.id ? this.extended = this.editedIsland.id : null
            },
            showSuccess (text) {
                this.snackColor = 'green'
                this.snackText = text
                this.snackbar = true
            },
            deleteIsland () {
                this.$store.dispatch('deleteIsland', this.islandToDelete.id)
                    .then(() => {
                        this.confirm = false
                        this.showSuccess(`Островок "${this.islandToDelete.name}" удален`)
                    })
            },
            showDeleteConfirm (island) {
                this.islandToDelete = island
                this.confirmText = `Удалить островок "${island.name}"?`
                this.confirm = true
            },
            showEditDialog (island) {
                this.mode = 'edit'
                this.editedIsland = JSON.parse(JSON.stringify(island))
                this.dialog = true
            },
            showAddDialog () {
                this.errors.clear()
                this.editedIsland = JSON.parse(JSON.stringify(this.defaultIsland))
                this.mode = 'add'
                this.dialog = true
            },
            submitForm () {
                if (this.mode === 'add') {
                    this.$store.dispatch('addIsland', this.editedIsland)
                        .then((res) => {
                            this.dialog = false
                            this.showSuccess(`Островок "${res.data.name}" добавлен`)
                        })
                } else {
                    this.$store.dispatch('updateIsland', this.editedIsland)
                        .then((res) => {
                            if (this.$store.state.workingIslandId === this.editedIsland.id) {
                                this.$store.dispatch('setMonthData')
                            }
                            this.dialog = false
                            this.showSuccess(`Данные островка "${res.data.name}" изменены`)
                        })
                }
            }
        },
        created () {
            this.editedIsland = JSON.parse(JSON.stringify(this.defaultIsland))
        },
        watch: {
            dialog (val) {
                if (val) {
                    if (this.mode === 'edit') {
                        this.islandBackup = JSON.stringify(this.editedIsland)
                    }
                } else {
                    this.extended = null
                }
            }
        },
        components: {
            IslandUsersColumn,
            ChiefUpdater,
            IslandVpbxChanger,
            IslandOptions
        }
    }
</script>
