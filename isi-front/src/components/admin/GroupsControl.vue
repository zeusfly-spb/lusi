<template>
    <v-flex aling-center>
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
            :items="groups"
            hide-actions
            class="elevation-1"
        >
            <template v-slot:items="props">
                <td>{{ props.item.id }}</td>
                <td>{{ props.item.name }}</td>
                <td>{{ props.item.description }}</td>
                <td><group-users-column :users="props.item.users"/></td>
                <td class="justify-center layout px-0">
                    <v-icon
                        small
                        class="mr-2 green--text"
                        @click="showEditDialog(props.item)"
                        title="Редактировать"
                    >
                        edit
                    </v-icon>
                    <v-icon
                        class="red--text"
                        small
                        @click="showDeleteConfirm(props.item)"
                        title="Удалить"
                    >
                        delete
                    </v-icon>
                </td>
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет групп</span>
            </template>

        </v-data-table>

        <v-dialog v-model="dialog" max-width="600px">
            <template v-slot:activator="{ on }">
                <v-btn flat color="primary" dark class="mb-2" @click="showAddDialog">
                    Добавить группу
                </v-btn>
            </template>
            <v-card>
                <v-card-title>
                    <span class="headline">{{ {add: 'Добавить', edit: 'Редактировать'}[mode] }} группу</span>
                </v-card-title>

                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md6>
                                <v-text-field v-model="editedGroup.name"
                                              label="Название"
                                              data-vv-as="Название"
                                              data-vv-name="name"
                                              :error-messages="errors.collect('name')"
                                              v-validate="'required'"
                                ></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md6>
                                <v-text-field v-model="editedGroup.description"
                                              label="Описание"
                                ></v-text-field>
                            </v-flex>

                        </v-layout>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="dialog = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="submitForm">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="confirm"
                  max-width="290"
        >
            <v-card>
                <v-card-title class="subheading">
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
                        @click="deleteGroup"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>

    </v-flex>

</template>

<script>
    import GroupUsersColumn from './groups/GroupUsersColumn'
    export default {
        name: 'GroupsControl',
        data: () => ({
            toDeleteGroup: null,
            confirmText: '',
            confirm: false,
            editedGroup: null,
            mode: 'add',
            dialog: false,
            snackbar: false,
            snackColor: 'green',
            snackText: '',
            headers: [
                {text: '#', value: 'id'},
                {text: 'Название', value: 'name'},
                {text: 'Описание', value: 'description', sortable: false},
                {text: 'Сотрудники', sortable: false},
                {text: 'Действия', sortable: false, align: 'center'}
            ],
            defaultGroup: {
                name: '',
                description: ''
            }
        }),
        computed: {
            groups () {
                return this.$store.state.groups
            }
        },
        methods: {
            deleteGroup () {
                this.$store.dispatch('deleteGroup', this.toDeleteGroup.id)
                    .then(() => {
                        this.confirm = false
                        this.showSuccess(`Группа "${this.toDeleteGroup.name}" удалена`)
                    })
                    .catch(e => {
                        if (e.error) {
                            this.showError(e.error)
                        }
                        console.error(e)
                    })
            },
            showSuccess (text) {
                this.snackColor = 'green'
                this.snackText = text
                this.snackbar = true
            },
            showError (text) {
                this.snackColor = 'red'
                this.snackText = text
                this.snackbar = true
            },
            submitForm () {
                let request = JSON.parse(JSON.stringify(this.editedGroup))
                delete(request.users)

                this.$validator.validate()
                    .then(res => {
                        if (res) {
                            if (this.mode === 'add') {
                                this.$store.dispatch('addGroup', request)
                                    .then(() => {
                                        this.dialog = false
                                        this.showSuccess('Новая группа создана')
                                    })
                            } else {
                                this.$store.dispatch('updateGroup', request)
                                    .then(() => {
                                        this.dialog = false
                                        this.showSuccess('Группа обновлена')
                                    })
                            }
                        }
                    })
            },
            showAddDialog () {
                this.errors.clear()
                this.mode = 'add'
                this.resetGroup()
                this.dialog = true
            },
            showEditDialog (group) {
                this.errors.clear()
                this.mode = 'edit'
                this.editedGroup = JSON.parse(JSON.stringify(group))
                this.dialog = true
            },
            showDeleteConfirm (group) {
                this.toDeleteGroup = group
                this.confirmText = `Удалить группу "${group.name}"`
                this.confirm = true
            },
            resetGroup () {
                this.editedGroup = JSON.parse(JSON.stringify(this.defaultGroup))
            }
        },
        created () {
            this.resetGroup()
        },
        mounted () {
            this.$store.dispatch('setGroups')
        },
        components: {
            GroupUsersColumn
        }
    }
</script>
