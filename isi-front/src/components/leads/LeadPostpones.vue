<template>
    <v-flex>
        <span
            v-if="lastPostpone"
            @click="activate"
            class="clickable last-postpone"
            title="Открыть календарь переноса звонков по заявке"
            :class="{today: lastPostpone.date.split(' ')[0] === accountingDate, lost: lastPostpone.date.split(' ')[0] < accountingDate}"
        >
            {{ $store.getters.withoutTZ(lastPostpone.date)  | moment('DD MMMM YYYY г. HH:mm') }}
        </span>
        <v-icon
            v-else
            @click="activate"
            class="clickable"
            title="Добавить дату перезвона по заявке"
        >
            phone_forwarded
        </v-icon>
        <v-dialog
            v-model="active"
            max-width="1000"
            persistent
        >
            <v-card style="border-radius: 5px">
                <v-card-title
                    class="light-blue darken-3"
                >
                    <span
                        class="title white--text"
                    >
                        Календарь переноса звонков по заявке с номера {{ lead.phone | phone }}
                    </span>
                    <v-spacer/>
                    <v-icon
                        color="white"
                        class="clickable mr-3"
                        title="Закрыть"
                        @click="active=false"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    <v-calendar
                        type="month"
                        locale="ru"
                        :weekdays="[1,2,3,4,5,6,0]"
                        ref="calendar"
                        v-model="newDate"
                        @click:date="selectDate"
                    >
                        <template v-slot:day="{ date }">
                            <v-menu
                                :value="date === openDate"
                                :close-on-content-click="false"
                            >
                                <template v-slot:activator="{ on }">
                                    <div v-on="on"></div>
                                </template>
                                <v-card>
                                    <v-card-title class="light-blue darken-3">
                                        <span class="subheading white--text" style="font-weight: bold">
                                            Время перезвона на {{ openDate | moment('DD MMM YYYY г.')}}
                                        </span>
                                    </v-card-title>
                                    <v-card-text>
                                        <v-time-picker v-model="selectedTime" format="24hr"/>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            flat="flat"
                                            @click="resetSelected"
                                        >
                                            Отмена
                                        </v-btn>
                                        <v-btn
                                            color="green darken-1"
                                            flat="flat"
                                            @click="savePostpone"
                                        >
                                            Назначить
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-menu>
                            <template v-for="postpone in postponesMap[date]">
                                <v-sheet
                                    :key="postpone.created_at"
                                    color="blue"
                                    class="white--text pa-1 mb-1"
                                    :title="`${postpone && postpone.user && postpone.user.full_name ? 'Добавлено пользователем ' + postpone.user.full_name : 'Добавлено Администратором'}`"
                                >
                                    <v-icon
                                        color="red"
                                        class="clickable mr-3"
                                        v-show="(isSuperadmin || +postpone.user_id === +authUser.id)"
                                        title="Удалить отметку"
                                        @click="showDeleteConfirm(postpone)"
                                    >
                                        close
                                    </v-icon>
                                    <div style="display: inline; text-align: center; font-weight: bold">{{ postpone.time.split(':').slice(0, 2).join(':') }}</div>
                                    <v-avatar
                                        v-if="postpone.user"
                                        size="18px"
                                        class="right"
                                    >
                                        <img :src="basePath + postpone.user.avatar" alt="Фото" v-if="postpone.user && postpone.user.avatar">
                                        <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-if="postpone.user && !postpone.user.avatar">
                                    </v-avatar>
                                </v-sheet>
                            </template>
                        </template>
                    </v-calendar>
                    <v-layout>
                        <v-btn
                            icon
                            title="Предыдущий месяц"
                            @click="calendar.prev()"
                        >
                            <v-icon>
                                keyboard_arrow_left
                            </v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            title="Следующий месяц"
                            @click="calendar.next()"
                        >
                            <v-icon>
                                keyboard_arrow_right
                            </v-icon>
                        </v-btn>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="confirm"
            max-width="500px"
        >
            <v-card>
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Подтвержение</span>
                </v-card-title>
                <v-card-text>
                    Удалить запланированный звонок на <span v-if="postponeToDelete">{{ postponeToDelete.date + ' ' + postponeToDelete.time | moment('DD MMMM YYYY г. HH:mm') }}?</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="confirm=false">Отмена</v-btn>
                    <v-btn color="red darken-1" flat @click="deletePostpone">Удалить</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </v-flex>
</template>
<script>
    const clearDate = date => date.includes('T') ? date.split('T')[0] : date.split(' ')[0]
    const clearTime = date => date.includes('T') ? date.split('T')[1] : date.split(' ')[1]

    export default {
        name: 'LeadPostpones',
        props: ['lead', 'open'],
        data: () => ({
            postponeToDelete: null,
            confirm: false,
            active: true,
            newDate: null,
            calendar: null,
            openDate: null,
            selectedTime: null
        }),
        computed: {
            accountingDate () {
                return this.$store.state.accountingDate
            },
            authUser () {
                return this.$store.state.authUser
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            basePath () {
                return this.$store.state.basePath
            },
            lastPostpone () {
                return this.lead.last_postpone
            },
            postpones () {
                const postponeUser = postpone => this.$store.getters.allUsers
                        .find(user => +user.id === +postpone.user_id) || null
                let base = this.lead.postpones
                return base.map(item => ({
                    id: item.id,
                    user: postponeUser(item),
                    date: clearDate(item.date),
                    time: clearTime(item.date),
                    open: false,
                    created_at: item.created_at
                }))
            },
            postponesMap () {
                const map = {}
                this.postpones.forEach(e => (map[e.date] = map[e.date] || []).push(e))
                return map
            }
        },
        methods: {
            pause () {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: false})
                setTimeout(() => this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: true}), 10000)
            },
            deletePostpone () {
                this.$store.dispatch('deleteLeadPostpone', {
                    postpone_id: this.postponeToDelete.id
                })
                    .then(() => {
                        this.$store.dispatch('pushMessage', {
                            text: 'Удален запланированный звонок',
                            color: 'green'
                        })
                        this.confirm = false
                        this.pause()
                    })
            },
            showDeleteConfirm (postpone) {
                this.postponeToDelete = postpone
                this.confirm = true
            },
            resetSelected () {
                this.openDate = null
                this.selectedTime = null
            },
            activate () {
                this.active = true
            },
            selectDate (data) {
                if (data.past) {
                    this.$store.dispatch('pushMessage', {
                        text: 'Невозможно назначить звонок на дату в прошлом!',
                        color: 'red'
                    })
                    return
                }
                this.openDate = data.date
            },
            savePostpone () {
                if (!this.openDate) return
                let time = this.selectedTime ? this.selectedTime + ':00' : '00:00:00'
                this.$store.dispatch('addLeadPostpone', {
                    lead_id: this.lead.id,
                    date: this.openDate,
                    time: time
                })
                    .then(() => {
                        this.resetSelected()
                        this.$store.dispatch('pushMessage', {
                            text: 'Заявке назначен перезвон',
                            color: 'green'
                        })
                        this.pause()
                    })
            }
        },
        mounted () {
            this.calendar = this.$refs.calendar
        },
        watch: {
            active (val) {
                if (!val) {
                    this.$store.commit('SET_OPEN_LEAD_ID', false)
                }
            }
        }
    }
</script>
<style scoped>
    .clickable {
        opacity: .8;
    }
    .clickable:hover {
        opacity: 1;
    }
    .last-postpone {
        cursor: pointer;
        opacity: .8;
    }
    .last-postpone:hover {
        opacity: 1;
        color: #263238;
    }
    .today {
        color: #2a9055;
        font-weight: bold;
    }
    .lost {
        color: red;
        font-weight: bold;
    }

</style>
