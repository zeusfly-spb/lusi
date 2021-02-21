<template>
    <v-flex align-center>
        <v-btn
            color="error"
            @click="showCloseSessionsConfirm"
        >
            <span
                class="ml-2 mr-2 white--text"
            >
                Завершить все активные сессии ({{ activeClients.length }})
            </span>
        </v-btn>
        <v-data-table
            hide-actions
            class="elevation-1"
            :headers="headers"
            :items="accessRequests"
        >
            <template v-slot:items="props">
                <td>{{ props.item.id }}</td>
                <td class="date-field">{{ props.item.created_at | moment('DD MMMM YYYY г.')}}</td>
                <td>{{ props.item.user_info }}</td>
                <td>{{ userName(props.item.user_id) }}</td>
                <td>{{ props.item.comment }}</td>
                <td><access-island-changer :access="props.item"/></td>
                <td :class="{'blue--text': props.item.status === 'requested', 'green--text': props.item.status === 'allowed', 'red--text': props.item.status === 'denied'}">
                        {{ {requested: 'Ожидает', allowed: 'Разрешен', denied: 'Запрещен'}[props.item.status] }}
                </td>
                <td class="justify-center layout px-0">
                    <v-icon
                        small
                        class="mr-2 green--text"
                        @click="setStatus(props.item, 'allowed')"
                        title="Разрешить"
                        v-if="props.item.status !== 'allowed'"
                    >
                        check_circle
                    </v-icon>
                    <v-icon
                        small
                        class="mr-2 red--text"
                        @click="setStatus(props.item, 'denied')"
                        title="Запретить"
                        v-if="props.item.status !== 'denied'"
                    >
                        cancel
                    </v-icon>
                    <v-icon
                        small
                        class="mr-2 amber--text"
                        @click="setStatus(props.item, 'requested')"
                        title="На ожидание"
                        v-if="props.item.status !== 'requested'"
                    >
                        hourglass_empty
                    </v-icon>

                    <v-icon
                        small
                        class="mr-2 red--text"
                        @click="showDeleteConfirm(props.item)"
                        title="Удалить"
                    >
                        delete_forever
                    </v-icon>

                </td>
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет запросов на доступ</span>
            </template>

        </v-data-table>

        <v-dialog v-model="confirm"
                  max-width="500"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="subheading light-blue darken-3 white--text">
                    Выберите островок для привязки устройства
                </v-card-title>

                <v-card-text>
                    <v-select
                        v-model="selectedIslandId"
                        :items="islands"
                        item-text="name"
                        item-value="id"
                        single-line
                    >
                    </v-select>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="confirm = false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        flat="flat"
                        @click="setAccessToIsland"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="deleteConfirm"
                  max-width="500px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="title red white--text">
                    Удаление доступа
                </v-card-title>
                <v-card-text>
                    Удалить выбранный доступ от
                    <strong class="ml-1 mr-1">{{ accessToDelete && accessToDelete.created_at | moment('D MMMM YYYY г.') }}</strong>
                    отправителя <strong class="ml-1">{{ accessToDelete && userName(accessToDelete.user_id) || '' }}</strong>?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        flat="flat"
                        @click="deleteConfirm = false"
                    >
                        Отмена
                    </v-btn>
                    <v-btn
                        color="red darken-1"
                        flat="flat"
                        @click="deleteAccess"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="closeSessionsConfirm"
            max-width="500px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="title red"
                >
                    <v-icon
                        color="white"
                        class="mr-2"
                    >
                        link_off
                    </v-icon>
                    <span class="title white--text">Завершение активных сессий</span>
                    <v-spacer/>
                </v-card-title>
                <v-card-text>
                    В данный момент в системе авторизовано <strong>{{ activeClients.length }}</strong> рабочие станции,
                    (включая вас), вы уверены, что хотите принудительно завершить все сеансы?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="hideCloseSessionsConfirm">Отмена</v-btn>
                    <v-btn color="red darken-1" flat @click="closeActiveSessions">Завершить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    import AccessIslandChanger from './accesses/AccessIslandChanger'
    import { v4 as uuidv4 } from 'uuid'

    export default {
        name: 'AccessesControl',
        data: () => ({
            closeSessionsConfirm: false,
            deleteConfirm: false,
            accessToDelete: null,
            currentAccessId: null,
            selectedIslandId: null,
            confirm: false,
            snackbar: false,
            snackColor: 'green',
            snackText: '',
            headers: [
                {text: '#', value: 'id'},
                {text: 'Дата', value: 'created_at'},
                {text: 'Информация об устройстве', value: null},
                {text: 'Отправитель', value: 'user_id'},
                {text: 'Комментарий', value: 'comment'},
                {text: 'Островок привязки', value: null},
                {text: 'Статус', value: 'status'},
                {text: 'Действия', align: 'center', value: null}
            ]
        }),
        computed: {
            activeClients () {
                return this.$store.state.ws.activeClients
            },
            islands () {
                return [...this.$store.state.islands, {id: null, name: 'Без островка'}]
            },
            users () {
                return this.$store.state.users
            },
            accessRequests () {
                return this.$store.state.accessRequests
            }
        },
        methods: {
            closeActiveSessions () {
                this.$store.dispatch('pushFrame', {type: 'close_active_sessions'})
            },
            hideCloseSessionsConfirm () {
                this.closeSessionsConfirm = false
            },
            showCloseSessionsConfirm () {
                this.closeSessionsConfirm = true
            },
            deleteAccess () {
                this.$store.dispatch('deleteAccess', this.accessToDelete.id)
                    .then(() => {
                        this.deleteConfirm = false
                        this.$store.dispatch('pushMessage', {text: 'Доступ удален'})
                    })
            },
            showDeleteConfirm (access) {
                this.accessToDelete = access
                this.deleteConfirm = true
            },
            setAccessToIsland () {
                this.axios.post('/api/set_access_status', {
                    access_id: this.currentAccessId,
                    status: 'allowed',
                    island_id: this.selectedIslandId
                })
                    .then(() => {
                        this.$store.dispatch('setAccessRequests')
                        let island = this.islands.find(island => +island.id === +this.selectedIslandId)
                        let islandName = island && island.name || ''
                        this.confirm = false
                        this.$store.dispatch('pushMessage', {text: `Статус доступа изменент на Разрешен с привязкой к островку "${islandName}"`})
                    })
            },
            setStatus (access, val) {
                if (val === 'allowed') {
                    this.currentAccessId = access.id
                    this.confirm = true
                    return
                }
                this.axios.post('/api/set_access_status', {
                    access_id: access.id,
                    status: val
                })
                    .then(() => {
                        this.$store.dispatch('setAccessRequests')
                            .then(() => this.$store.dispatch('pushMessage', {
                                text: `Статус доступа изменен на ${{allowed: 'Разрешен', denied: 'Запрещен', requested: 'На ожидании'}[val]}`
                            }))
                    })

            },
            userName (id) {
                let user = this.users.find(item => item.id === id)
                return user && user.full_name || ''
            }
        },
        mounted () {
            let request = {
                id: uuidv4(),
                title: 'Загрузка активных клиентов',
                page: 'admin'
            }
            this.$store.dispatch('pushFrame', {
                type: 'request_get_active_clients',
                request
            })
        },
        components: {
            AccessIslandChanger
        }
    }
</script>
<style>
    .date-field {
        width: 15em;
    }
</style>
