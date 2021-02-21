<template>
    <v-flex
        v-blur="smsReportsLoading"
    >
        <v-data-table
            :headers="headers"
            :items="smsReports"
            hide-actions
        >
            <template v-slot:items="props">
                <tr>
                    <td
                        align="left"
                        class="index-column"
                    >
                        {{ props.index + 1}}
                    </td>
                    <td
                        align="left"
                        class="user-column"
                    >
                        <user-avatar
                            v-if="props.item.user"
                            :user="props.item.user"
                        />
                        <v-avatar
                                v-if="!props.item.user"
                                size="36px"
                                title="Служба информирования"
                        >
                            <img
                                :src="`${basePath}/img/logo.png`"
                            />
                        </v-avatar>
                    </td>
                    <td
                        class="phone-column"
                    >
                        {{ props.item.number.slice(2) | phone }}
                    </td>
                    <td>
                        {{ props.item.text }}
                    </td>
                    <td
                        align="right"
                        class="time-column"
                    >
                        {{ props.item.created_at | moment('H:mm') }}
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <span class="red--text">Нет оповещений от {{ eventsDate | moment('D MMMM YYYY г.') }}</span>
            </template>
        </v-data-table>
    </v-flex>
</template>

<script>
    import UserAvatar from '../main/UserAvatar'
    export default {
        name: 'NotificationTable',
        data: () => ({
            headers: [
                {text: '#', value: null},
                {text: 'Отправитель', value: 'user_id'},
                {text: 'Номер', value: 'number'},
                {text: 'Текст', value: 'text'},
                {text: 'Время', value: 'created_at', align: 'right'}
            ]
        }),
        computed: {
            basePath () {
                return this.$store.state.basePath
            },
            eventsDate () {
                return this.$store.getters.eventsDate
            },
            smsReportsLoading () {
                return this.$store.state.informer.smsReportsLoading
            },
            smsReports () {
                const attachUsers = reports => reports.reverse()
                    .map(item => ({
                        ... item,
                        user: this.$store.state.users.find(user => +user.id === +item.user_id) || null
                    }))
                return attachUsers(this.$store.state.informer.smsReports)
            }
        },
        methods: {
            setSmsReports () {
                this.$store.dispatch('setSmsReports')
            }
        },
        created () {
            this.setSmsReports()
        },
        watch: {
            eventsDate (val, oldVal) {
                if (!oldVal) {
                    return
                }
                this.setSmsReports()
            }
        },
        components: {
            UserAvatar
        }
    }
</script>

<style scoped>
    .index-column {
        width: 2em;
    }
    .user-column {
        width: 2em;
    }
    .phone-column {
        width: 12em;
    }
    .time-column {
        width: 3em;
    }
</style>
