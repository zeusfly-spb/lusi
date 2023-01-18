<template>
    <v-flex
        align-center
    >
        <v-snackbar
            v-model="snackbar"
            auto-height
            top
            :timeout="3000"
            :color="snackColor"
        >
            <span>{{ errorText }}</span>
        </v-snackbar>

        <v-flex>
            <v-btn
                small
                v-for="(mode, index) in viewModes"
                @click="setViewMode(mode)"
                :key="index"
                :depressed="mode === currentViewMode"
                :color="mode === currentViewMode ? 'grey lighten-1' : null"
            >
                {{ {work: 'Работают', fire: 'Уволены', all: 'Все'}[mode] }} ({{ mode === 'all' ? counts.all : mode === 'fire' ? counts.fire : counts.work}})
            </v-btn>
        </v-flex>

        <v-data-table
            :headers="headers"
            :items="users"
            hide-actions
            class="elevation-1"
        >
            <template v-slot:items="props">
                <td>
                    <v-avatar
                        size="36px"
                    >
                        <img :src="basePath + props.item.avatar" alt="Фото" v-if="props.item.avatar">
                        <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else>
                    </v-avatar>
                </td>
                <td>{{ props.item.name }}</td>
                <td>{{ props.item.last_name }}</td>
                <td>{{ props.item.first_name }}</td>
                <td>{{ props.item.patronymic }}</td>
                <td>{{ props.item.birth_date | moment('DD MMMM YYYY г.') }}</td>
                <td><span v-if="props.item.phone && props.item.phone.length === 10">{{ props.item.phone | phone }}</span></td>
                <td>{{ props.item.address }}</td>
                <td align="center">
                    <doc-pack :user="props.item" @updated="showSuccess" @alert="showError"/>
                </td>
                <td><user-islands-column :user="props.item" @success="showSuccess"/></td>
                <td>{{ groupName(props.item.group_id) }}</td>
                <td>{{`${props.item.vpbx_extension || '-'}`}}</td>
                <td v-if="currentViewMode !== 'all'">
                    <date-updater :user="props.item" field="created_at" @updated="showSuccess"/>
                </td>
                <td v-if="currentViewMode === 'fire'">
                    <date-updater :user="props.item" field="fired_at"/>
                </td>
                <td class="justify-center layout px-0">
                    <v-icon
                        small
                        class="mr-2 green--text"
                        @click="editUser(props.item)"
                        title="Редактировать"
                    >
                        edit
                    </v-icon>
                    <v-icon
                        small
                        class="mr-2 red--text"
                        title="Уволить"
                        v-if="currentViewMode !== 'fire'"
                        @click="showFireConfirm(props.item)"
                        v-show="!props.item.fired_at"
                    >
                        person_add_disabled
                    </v-icon>
                    <v-icon
                        small
                        class="mr-2 blue--text"
                        title="Восттановить"
                        v-if="currentViewMode !== 'work'"
                        @click="showRestoreConfirm(props.item)"
                        v-show="!!props.item.fired_at"
                    >
                        settings_backup_restore
                    </v-icon>
                    <v-icon
                        class="mr-2 red--text"
                        small
                        @click="showDeleteConfirm(props.item)"
                        title="Удалить"
                    >
                        delete
                    </v-icon>
                </td>
            </template>

            <template v-slot:no-data>
                <span class="red--text">Нет сотрудников</span>
            </template>
        </v-data-table>

            <v-dialog v-model="dialog" max-width="1000px">
            <template v-slot:activator="{ on }">
                <v-btn color="primary" flat dark class="mb-2"
                       @click="addUser"
                       v-show="currentViewMode === 'work'"
                >
                    Добавить сотрудника
                </v-btn>
            </template>
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">{{ {add: 'Добавить', edit: 'Редактировать'}[mode] }} сотрудника</span>
                </v-card-title>

                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.name"
                                              label="Логин"
                                              data-vv-as="Логин"
                                              data-vv-name="name"
                                              :error-messages="errors.collect('name')"
                                              v-validate="mode === 'add' ? 'required|max:10' : null"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.password"
                                              label="Пароль"
                                              type="password"
                                              data-vv-as="Пароль"
                                              data-vv-name="password"
                                              :error-messages="errors.collect('password')"
                                              v-validate="mode === 'add' ? 'required' : null"
                                              ref="password"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.c_password"
                                              label="Повторите пароль"
                                              type="password"
                                              data-vv-as="Подтверждение пароля"
                                              data-vv-name="password_confirm"
                                              :error-messages="errors.collect('password_confirm')"
                                              v-validate="mode === 'add' ? 'required|confirmed:password' : null"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.last_name" label="Фамилия"></v-text-field>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.first_name"
                                              label="Имя"
                                              data-vv-as="Имя"
                                              data-vv-name="first_name"
                                              :error-messages="errors.collect('first_name')"
                                              v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.patronymic" label="Отчество"/>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-menu
                                    :close-on-content-click="false"
                                    :nudge-right="40"
                                    lazy
                                    transition="scale-transition"
                                    offset-y
                                    full-width
                                    min-width="290px"
                                    v-model="menu"
                                >
                                    <template v-slot:activator="{ on }">
                                        <v-text-field
                                            :label="editedUser.birth_date | moment('DD MMMM YYYY г.')"
                                            prepend-icon="event"
                                            readonly
                                            v-on="on"
                                        />
                                    </template>
                                    <v-date-picker v-model="date" no-title scrollable
                                                   @change="datePicked"
                                    />
                                </v-menu>
                                <sup>Дата рождения </sup>
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedUser.phone"
                                    label="Телефон"
                                    data-vv-as="Номер телефона"
                                    data-vv-name="phone"
                                    :error-messages="errors.collect('phone')"
                                    v-validate="'digits:10'"
                                    mask="(###) ### - ####"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field v-model="editedUser.address" label="Адрес"/>
                            </v-flex>

                            <v-flex xs12 sm6 md4>
                                <img
                                    v-if="editedUser.avatar"
                                    :src="basePath + editedUser.avatar"
                                    :alt="'Нет фото'"
                                    width="150px"
                                    style="cursor: pointer"
                                    @click="$refs.avatarInput.click()"
                                    ref="avatarPhoto"
                                    title="Изменить фото"
                                />
                                <img
                                    v-else
                                    :src="`${basePath}/img/default.jpg`"
                                    :alt="'Нет фото'"
                                    width="150px"
                                    style="cursor: pointer"
                                    @click="$refs.avatarInput.click()"
                                    ref="avatarPhoto"
                                    title="Изменить фото"
                                />
                                <br>
                                <sup>Фото</sup>
                                <input type="file"
                                       name="avatar"
                                       ref="avatarInput"
                                       accept="image/*"
                                       @change="loadAvatar"
                                       style="display: none"
                                >
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>&nbsp;</sub>
                                <v-text-field
                                    v-model="editedUser.email"
                                    label="Электронная почта"
                                    data-vv-as="Адрес электронной почты"
                                    data-vv-name="email"
                                    :error-messages="errors.collect('email')"
                                    v-validate="'email'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <sub>Группа</sub>
                                <v-select
                                    v-model="editedUser.group_id"
                                    :items="groups"
                                    item-text="name"
                                    item-value="id"
                                    single-line
                                    data-vv-name="group"
                                    data-vv-as="Группа"
                                    :error-messages="errors.collect('group')"
                                    v-validate="'required'"
                                />
                            </v-flex>
                            <v-flex xs12 sm6 md4>
                                <v-text-field
                                    v-model="editedUser.vpbx_extension"
                                    label="Персональный код манго"
                                    data-vv-as="Код манго"
                                    data-vv-name="vpbx"
                                    :error-messages="errors.collect('vpbx')"
                                    v-validate="'numeric'"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="dialog = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="saveUser(editedUser)">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="confirm"
                  max-width="500"
        >
            <v-card class="round-corner">
                <v-card-title class="subheading light-blue darken-3 white--text">
                    {{ confirmText }}
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="cancelOperation"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        v-if="!!toDeleteUserId"
                        color="red darken-1"
                        flat="flat"
                        @click="deleteUser"
                    >
                        Удалить
                    </v-btn>
                    <v-btn
                        v-if="!!toFireUserId"
                        color="red darken-1"
                        flat="flat"
                        @click="fireUser"
                    >
                        Уволить
                    </v-btn>
                    <v-btn
                        v-if="!!toRestoreUserId"
                        color="green darken-1"
                        flat="flat"
                        @click="restoreUser"
                    >
                        Восстановить
                    </v-btn>

                </v-card-actions>
            </v-card>

        </v-dialog>

    </v-flex>
</template>

<script>
    import DocPack from './users/DocPack'
    import DateUpdater from './users/DateUpdater'
    import UserIslandsColumn from './users/UserIslandsColumn'
    export default {
        data: () => ({
            toRestoreUserId: null,
            toFireUserId: null,
            currentViewMode: 'work',
            viewModes: ['work', 'fire', 'all'],
            avatarFileReader: {},
            toDeleteUserId: null,
            confirmText: '',
            confirm: false,
            snackColor: 'green',
            errorText: '',
            menu: false,
            date: '',
            mode: '',
            editedUser: null,
            defaultUser: {
                password: '',
                c_password: '',
                name: '',
                first_name: '',
                last_name: '',
                patronymic: '',
                birth_date: '',
                address: '',
                phone: '',
                group_id: '',
                island_id: '',
                email: '',
                avatar: null,
                vpbx_extension: ''
            },
            snackbar: false,
            dialog: false
        }),
        computed: {
            counts () {
                return {
                    all: this.$store.state.users.length,
                    work: this.$store.state.users.filter(user => !user.fired_at).length,
                    fire: this.$store.state.users.filter(user => !!user.fired_at).length,
                }
            },
            basePath () {
                return this.$store.state.basePath
            },
            users () {
                switch (this.currentViewMode) {
                    case 'all':
                        return this.$store.state.users
                    case 'work':
                        return this.$store.state.users.filter(user => !user.fired_at)
                    case 'fire':
                        return this.$store.state.users.filter(user => !!user.fired_at)
                }
            },
            groups () {
                return this.$store.state.groups
            },
            islands () {
                return this.$store.state.islands
            },
            headers () {
                let base = [
                    {
                        text: '#',
                        value: 'id'
                    },
                    {
                        text: 'Логин',
                        sortable: false,
                        value: 'name'
                    },
                    {
                        text: 'Фамилия',
                        value: 'last_name'
                    },
                    {
                        text: 'Имя',
                        value: 'first_name'
                    },
                    {
                        text: 'Отчество',
                        sortable: false,
                        value: 'patronymic'
                    },
                    {
                        text: 'Дата рождения',
                        value: 'birth_date'
                    },
                    {
                        text: 'Телефон',
                        sortable: false,
                        value: 'phone'
                    },
                    {
                        text: 'Адрес',
                        sortable: false,
                        value: 'address'
                    },
                    {
                        text: 'Документы',
                        sortable: false,
                        value: null
                    },
                    {
                        text: 'Островки',
                        value: null
                    },
                    {
                        text: 'Группа',
                        value: null
                    },
                    {
                        text: 'Код манго',
                        value: 'vpbx_extension'
                    },
                    {
                        text: 'Дата приема',
                        value: 'created_at'
                    },
                    {
                        text: 'Дата увольнения',
                        value: 'fired_at'
                    },
                    {
                        text: 'Действия',
                        sortable: false,
                        value: null
                    }
                ]
                switch (this.currentViewMode) {
                    case 'fire':
                        return base
                    case 'all':
                        return base.filter(item => item.text !== 'Дата увольнения' && item.text !== 'Дата приема')
                    default:
                        return base.filter(item => item.text !== 'Дата увольнения')
                }
            }
        },
        methods: {
            restoreUser () {
                this.$store.dispatch('restoreUser', this.toRestoreUserId)
                    .then(() => {
                        this.confirm = false
                        this.showSuccess('Сотрудник восстановлен')
                        this.toRestoreUserId = null
                    })
            },
            cancelOperation () {
                [this.confirm, this.toDeleteUserId, this.toFireUserId, this.toRestoreUserId] = [false, null, null, null]
            },
            showRestoreConfirm (user) {
                this.toRestoreUserId = user.id
                this.confirmText = `Восстановить сотрудника ${user.full_name}?`
                this.confirm = true
            },
            setViewMode (mode) {
                this.currentViewMode = mode
            },
            fireUser () {
                this.$store.dispatch('fireUser', this.toFireUserId)
                    .then(() => {
                        this.confirm = false
                        this.showSuccess('Сотрудник уволен')
                        this.toFireUserId = null
                    })
            },
            showFireConfirm (user) {
                this.toFireUserId = user.id
                this.confirmText = `Уволить сотрудника ${user.full_name}?`
                this.confirm = true
            },
            islandName (id) {
                let island = this.islands && this.islands.find(island => island.id === id)
                return island && island.name || '-'
            },
            loadAvatar () {
                this.editedUser.avatar = this.$refs.avatarInput.files[0]
                this.avatarFileReader.readAsDataURL(this.$refs.avatarInput.files[0])
            },
            groupName (id) {
                let group = this.groups.find(group => +group.id === +id)
                return group && group.name || ' - '
            },
            deleteUser () {
                this.$store.dispatch('deleteUser', this.toDeleteUserId)
                    .then(() => {
                        this.confirm = false
                        this.showSuccess('Сотрудник удален')
                        this.toDeleteUserId = null
                    })
                    .catch(e => console.error(e))
            },
            showDeleteConfirm (user) {
                this.toDeleteUserId = user.id
                this.confirmText = `Удалить сотрудника ${user.full_name}?`
                this.confirm = true
            },
            showSuccess (text) {
                this.snackColor = 'green'
                this.errorText = text
                this.snackbar = true
            },
            showError (text) {
                this.snackColor = 'red'
                this.errorText = text
                this.snackbar = true
            },
            datePicked (date) {
                this.editedUser.birth_date = new Date(date).toISOString().split('T')[0]
                this.menu = false
            },
            saveUser (user) {
                let data = new FormData
                for (let key in user) {
                    if (user[key] || key === 'phone' || key === 'first_name' || key === 'last_name' || key === 'patronymic' || key === 'vpbx_extension') {
                        data.append(key, user[key])
                    }
                }
                if (this.mode === 'edit') {
                    const update = () => {
                        this.$store.dispatch('updateUser', data)
                            .then(() => {
                                this.dialog = false
                                this.showSuccess('Данные сотрудника обновлены')
                            })
                            .catch(e => {
                                if (e.error) {
                                    this.showError(e.error)
                                }
                                console.error(e)
                            })
                    }
                    this.$validator.validate()
                        .then(res => {
                            res ? update() : null
                        })
                } else {
                    this.$validator.validate()
                        .then(res => {
                            if (res) {
                                this.$store.dispatch('addUser', data)
                                    .then(() => {
                                        this.dialog = false
                                        this.showSuccess('Сотрудник добавлен')
                                    })
                                    .catch(e => {
                                        if (e.error) {
                                            this.showError(e.error)
                                        }
                                        console.error(e)
                                    })
                            }
                        })
                }
            },
            editUser (user) {
                this.errors.clear()
                this.mode = 'edit'
                user = {... user, group_id: + user.group_id}
                this.editedUser = JSON.parse(JSON.stringify(user))
                this.dialog = true
            },
            addUser () {
                this.errors.clear()
                this.editedUser = JSON.parse(JSON.stringify(this.defaultUser))
                this.mode = 'add'
                this.dialog = true
            }
        },
        created () {
            this.editedUser = JSON.parse(JSON.stringify(this.defaultUser))

            this.avatarFileReader = new FileReader()
            this.avatarFileReader.onload = (e)=> {
                this.$refs.avatarPhoto.src = e.target.result
            }
        },
        filters: {
            phone: function (val) {
                return '+7 ' + val.replace(/[^0-9]/g, '')
                    .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
            }
        },
        components: {
            DocPack,
            DateUpdater,
            UserIslandsColumn
        }
    }
</script>
<style scoped>
    .round-corner {
        border-radius: 5px;
    }
</style>

