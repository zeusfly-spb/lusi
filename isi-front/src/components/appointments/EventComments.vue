<template>
    <div>
        <v-dialog
            v-if="list"
            v-model="list"
            max-width="1000px"
            :persistent="addMode"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                        class="light-blue darken-3 white--text title"
                >
                    <v-icon
                            color="white"
                            class="pr-2"
                    >
                        comment
                    </v-icon>
                    <span
                        class="title white--text"
                    >
                        {{ listTitle }}
                    </span>
                    <span
                        class="orange--text pl-1"
                    >
                        {{ event.date | moment('D MMMM YYYY г. HH:mm') }}
                    </span>
                    <span class="pl-1">клиента</span>
                    <span
                        class="yellow--text title pl-1"
                    >
                        {{ event.client_name }}
                    </span>
                    <v-spacer/>
                    <v-icon
                        color="white"
                        class="clickable"
                        title="Закрыть список комментариев"
                        @click="hideList"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text
                    v-blur="$store.state.appointment.archiveCommentsLoading"
                    class="list-entry"
                >
                    <event-comment-adder
                            v-model="addMode"
                            :event="event"
                    />
                    <v-data-table
                        :items="comments"
                        hide-actions
                        hide-headers
                    >
                        <template
                            v-slot:items="props"
                        >
                            <td
                                align="left"
                                class="control-field"
                            >
                                <event-comment-remover
                                        v-if="props.item.canDelete"
                                        :comment="props.item"
                                        :event="event"
                                />
                            </td>
                            <td
                                class="avatar-field"
                            >
                                <user-avatar
                                    v-if="props.item.user"
                                    :user="props.item.user"
                                />
                                <v-avatar
                                    size="36px"
                                    v-else
                                    title="Системный комментарий"
                                >
                                    <img
                                        :src="`${basePath}/img/logo.png`"
                                    />
                                </v-avatar>
                            </td>
                            <td
                                align="left"
                            >
                                <span
                                    :class="{'system': !props.item.user_id}"
                                >
                                   {{ props.item.text }}
                                </span>
                            </td>
                            <td
                                align="right"
                            >
                                {{ props.item.created_at | moment('D MMMM YYYY г. HH:mm')}}
                            </td>
                        </template>
                        <template v-slot:no-data>
                            <span class="gray--text">Нет комментариев</span>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    import EventCommentAdder from "./EventCommentAdder"
    import UserAvatar from "../main/UserAvatar"
    import EventCommentRemover from "./EventCommentRemover";
    export default {
        name: 'EventComments',
        data: () => ({
            addMode: false,
            list: true
        }),
        computed: {
            event () {
                return this.$store.getters.commentsOpenEvent
            },
            basePath () {
                return this.$store.state.basePath
            },
            users () {
                return this.$store.state.users
            },
            listTitle () {
                return `Комментарии к записи от`
            },
            lastComment () {
                return this.comments[0]
            },
            comments: {
                get () {
                    let base = this.event && this.event.comments || null
                    if (!base || !base.length) {
                        return []
                    }
                    const getUser = (id) => {
                        let user = this.users.find(user => user.id === id)
                        if (+id === 1) {
                            user.full_name = 'Администратор'
                        }
                        return user
                    }
                    const today = (comment) => {
                        let commentDay = comment && comment.created_at && comment.created_at.split(' ')[0] || null
                        return this.$store.state.realDate === commentDay
                    }
                    const canDelete = (comment) => {
                        let hasPermission = !comment.user_id ? false
                            :this.$store.state.authUser.is_superadmin ? true
                                : +comment.user_id === +this.$store.state.authUser.id
                        return hasPermission && today(comment)
                    }
                    return base.map(item => ({
                        ...item,
                        user: getUser(item.user_id),
                        canDelete: canDelete(item)
                    })).reverse()
                }
            }
        },
        methods: {
            addFirst () {
                this.showList()
                this.addMode = true
            },
            showList () {
                this.list = true
            },
            hideList () {
                this.list = false
            }
        },
        watch: {
            list (val) {
                !val ? this.$store.commit('SET_ARCHIVE_COMMENTS_OPEN_ID', null) : null
                this.addMode = false
            },
            addMode (val) {
                !val ? setTimeout(() => !this.comments.length ? this.hideList() : null, 300) : null
            }
        },
        components: {
            UserAvatar,
            EventCommentAdder,
            EventCommentRemover
        }
    }
</script>
<style scoped>
    .avatar-field {
        padding: 0!important;
    }
    .control-field {
        padding-left: 1em!important;
        padding-right: 0!important;
        width: 3em;
    }
    .list-entry {
        padding-top: 0!important;
        padding-left: 0!important;
        padding-right: 0!important;
    }
    .count {
        color: #2e7d32;
    }
    .system {
        color: #01579B;
    }
</style>
