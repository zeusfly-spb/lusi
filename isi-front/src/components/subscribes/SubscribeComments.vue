<template>
    <v-flex>
    <v-dialog
        v-model="active"
        max-width="1000px"
        :persistent="addMode"
    >
        <v-card
            class="round-corner"
        >
            <v-card-title
                class="light-blue darken-3"
            >
                <v-icon
                    color="white"
                    class="pr-2"
                >
                    comment
                </v-icon>
                <span
                    class="white--text title"
                >
                    Комментарии к абонементу <span class="yellow--text"><strong>{{ subscriptionName }}</strong></span> от <span class="orange--text"><strong>{{ subscribeStartDate }}</strong></span>
                </span>
                <v-spacer/>
                <v-icon
                    color="white"
                    class="clickable"
                    title="Закрыть панель комментариев"
                    @click="close"
                >
                    close
                </v-icon>
            </v-card-title>
            <v-card-text>
                <v-icon
                    v-if="!addMode"
                    color="green"
                    class="clickable"
                    title="Добавить комментарий"
                    @click="addModeOn"
                >
                    add_circle_outline
                </v-icon>
                <v-text-field
                    v-blur="updating"
                    autofocus
                    label="Новый комментарий"
                    v-if="active && addMode"
                    v-model="newCommentText"
                    ref="addInput"
                    @keyup.esc="addModeOff"
                    @blur="addModeOff"
                    @keyup.enter="saveNewComment"
                />
                <v-data-table
                    v-blur="updating"
                    :items="comments"
                    hide-headers
                    hide-actions
                >
                    <template v-slot:items="props">
                        <td
                            style="width: 1em"
                            align="left"
                        >
                            <v-icon
                                v-if="canDelete(props.item)"
                                color="red"
                                class="clickable"
                                title="Удалить комментарий"
                                @click="confirmDelete(props.item)"
                            >
                                close
                            </v-icon>
                        </td>
                        <td>
                            {{ props.item.text }}
                        </td>
                        <td
                            style="width: 3em"
                            align="right"
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
                            style="width: 15em"
                            align="right"
                        >
                            {{ props.item.created_at | moment('D MMMM YYYY г. H:m')}}
                        </td>
                    </template>
                    <template v-slot:no-data>
                        <span class="red--text">Нет комментариев</span>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog
        v-model="confirm"
        max-width="500px"
    >
        <v-card
            class="round-corner"
        >
            <v-card-title
                class="red darken-3"
            >
                <span class="white--text title">
                    Подтверждение
                </span>
            </v-card-title>
            <v-card-text>
                <span
                    class="subheading"
                >
                    Удалить комментарий <strong>"{{ commentToDelete && commentToDelete.text || ''}}"</strong> ?
                </span>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="darken-1" flat @click="hideConfirm">Отмена</v-btn>
                <v-btn color="red darken-1" flat @click="deleteComment">Удалить</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    </v-flex>

</template>

<script>
    import UserAvatar from '../main/UserAvatar'
    export default {
        name: 'SubscribeComments',
        data: () => ({
            commentToDelete: null,
            newCommentText: '',
            addMode: false
        }),
        computed: {
            confirm: {
                get () {
                    return !!this.commentToDelete
                },
                set (val) {
                    !val ? this.commentToDelete = null : null
                }
            },
            updating () {
                return this.$store.state.subscribes.commentsUpdating
            },
            empty () {
                return this.comments && this.comments.length === 0
            },
            basePath () {
                return this.$store.state.basePath
            },
            subscribeStartDate () {
                return this.subscribe && this.subscribe.start_date && this.$moment(this.subscribe.start_date).format('D MMMM YYYY г.') || ''
            },
            subscriptionName () {
                return this.subscribe && this.subscribe.subscription && this.subscribe.subscription.name || 'Абонемент'
            },
            comments () {
                let base = this.subscribe && this.subscribe.comments && Object.values(this.subscribe.comments) || []
                return base.map(item => ({
                    ... item,
                    user: this.$store.state.users.find(user => +user.id === +item.user_id)
                }))
            },
            subscribe () {
                if (!this.commentsOpenId) {
                    return null
                }
                return this.$store.state.subscribes.subscribes
                    .find(item => item.id === this.commentsOpenId)
            },
            active: {
                get () {
                    return !!this.commentsOpenId
                },
                set (val) {
                    !val ? this.$store.commit('SET_SUBSCRIBE_COMMENTS_OPEN_ID', null) : null
                }
            },
            commentsOpenId () {
                return this.$store.state.subscribes.commentsOpenId
            }
        },
        methods: {
            deleteComment () {
                this.$store.dispatch('deleteSubscribeComment', {
                    subscribe_id: this.subscribe.id,
                    comment_id: this.commentToDelete.id
                })
                    .then(() => this.hideConfirm())
            },
            hideConfirm () {
                this.confirm = false
            },
            confirmDelete (comment) {
                this.commentToDelete = comment
            },
            canDelete (comment) {
                if (!comment.created_at || comment.created_at && comment.created_at.split(' ')[0] !== this.$store.state.realDate) {
                    return false
                }
                return this.$store.getters.isSuperadmin ? true : +comment.user_id === +this.$store.state.authUser.id
            },
            saveNewComment () {
                this.$store.dispatch('addSubscribeComment', {
                    subscribe_id: this.subscribe.id,
                    text: this.newCommentText
                })
                    .then(() => this.addModeOff())
            },
            addModeOff () {
                this.addMode = false
            },
            addModeOn () {
                this.addMode = true
            },
            close () {
                this.active = false
            }
        },
        watch: {
            addMode (val) {
                val ? this.newCommentText = '' : null
                if (!val && this.empty) {
                    this.close()
                }
            },
            active (val) {
                val && this.empty ? this.addModeOn() : null
            }
        },
        components: {
            UserAvatar
        }
    }
</script>

