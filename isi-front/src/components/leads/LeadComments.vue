<template>
    <v-flex>
        <span
            v-if="comments.length"
            :title="comments.length > 1 ? `Показать все комментарии к заявке с номера ${lead.phone}` : `Открыть панель  комментариев к заявке с номера ${lead.phone}`"
            @click="activate"
            class="clickable fat-able"
        >
            {{ lastComment.text }}
            <span class="green--text accent-4"
                  v-if="comments.length > 1"
            >
                <strong>({{ comments.length }})</strong>
            </span>
        </span>
        <v-icon
            v-else
            color="green"
            title="Добавить комментарий к заявке"
            class="clickable"
            @click="activate"
        >
            add_circle
        </v-icon>
        <v-dialog
            v-model="active"
            max-width="1000px"
            :persistent="adding"
        >
            <v-card class="round-corner">
                <v-card-title
                    class="light-blue darken-3"
                >
                    <span class="title white--text">
                        Комментарии к заявке с номера {{ lead.phone | phone }} от
                        <span class="yellow--text">{{ lead.created_at | moment('DD/MM/YY') }}</span>
                        <span class="lime--text accent-3 pl-2">{{ lead.created_at | moment('HH:mm') }}</span>
                        <span class="orange--text lighten-5 pl-2" v-if="lead.name">
                            {{ $store.getters.truncate(lead.name, 15, '...') }}
                        </span>
                    </span>
                </v-card-title>
                <v-card-text>
                    <v-container
                        grid-list-md
                        style="padding: 0!important; margin: 0!important;"
                    >
                        <v-layout v-if="adding">
                            <v-text-field
                                label="Новый комментарий"
                                v-model="newComment"
                                height="1em"
                                autofocus
                                @keyup.esc="adding = false"
                                @keyup.enter="addComment"
                                data-vv-as="Комментарий"
                                data-vv-name="comment"
                                :error-messages="errors.collect('comment')"
                                v-validate="'required'"
                            />
                        </v-layout>
                        <v-icon
                            v-else
                            @click="adding = true"
                            color="green"
                            title="Добавить комментарий"
                            class="fat-able"
                        >
                            add_circle_outline
                        </v-icon>
                        <v-flex>
                            <v-data-table
                                :items="comments"
                                :headers="headers"
                                hide-actions
                                hide-headers
                            >
                                <template v-slot:items="props">
                                    <td>
                                        <v-icon
                                            color="red"
                                            class="clickable"
                                            v-show="(isSuperadmin || +props.item.user_id === +authUser.id) && props.item.created_at.split(' ')[0] === realDate"
                                            title="Удалить комментарий"
                                            @click="showDeleteConfirm(props.item)"
                                        >
                                            close
                                        </v-icon>
                                    </td>
                                    <td>
                                        <span>{{ props.item.text }}</span>
                                    </td>
                                    <td align="right">
                                        <v-avatar
                                            size="36px"
                                            :title="props.item.user && props.item.user.full_name || ''"
                                        >
                                            <img :src="basePath + props.item.user.avatar" alt="Фото" v-if="props.item.user && props.item.user.avatar">
                                            <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-if="props.item.user && !props.item.user.avatar">
                                            <img :src="basePath + '/img/www.png'" alt="Без фото" v-if="!props.item.user">
                                        </v-avatar>
                                    </td>
                                    <td align="right">
                                        <span>{{ props.item.created_at | moment('DD MMM YYYY г. HH:mm:ss') }}</span>
                                    </td>
                                </template>
                                <template v-slot:no-data>
                                    <span class="red--text">Нет комментариев</span>
                                </template>
                            </v-data-table>
                        </v-flex>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="active = false">Закрыть</v-btn>
                    <v-btn color="green darken-1"
                           flat
                           v-if="adding"
                           @click="addComment"
                    >
                        Добавить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="confirm"
            max-width="400"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="red darken-3">
                    <span class="title white--text">Подтверждение</span>
                </v-card-title>
                <v-card-text>
                    Удалить комментарий <strong>{{ commentToDelete && commentToDelete.text || ''}}</strong>?
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="confirm = false">Отмена</v-btn>
                    <v-btn color="red darken-1"
                           flat
                           @click="deleteComment"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'LeadComments',
        props: ['lead', 'open'],
        data: () => ({
            active: true,
            adding: false,
            confirm: false,
            commentToDelete: null,
            newComment: '',
            headers: [
                {text: 'Действия', value: null, sortable: false},
                {text: 'Комментарий', value: null, sortable: false},
                {text: 'Автор', value: null, sortable: false},
                {text: 'Дата/Время', value: null, sortable: false}
            ]
        }),
        computed: {
            basePath () {
                return this.$store.state.basePath
            },
            lastComment () {
                return this.comments.length && this.comments[0]
            },
            comments () {
                const appendUser = comment => {
                    let user = this.$store.getters.allUsers
                        .find(user => user.id === comment.user_id)
                    comment.user = user || null
                    return comment
                }
                let base = JSON.parse(JSON.stringify(this.lead))
                return base && base.comments && base.comments.map(comment => appendUser(comment))|| []
            },
            isToday () {
                return this.$store.state.accountingDate === this.realDate
            },
            realDate () {
                return this.$store.state.realDate
            },
            authUser () {
                return this.$store.state.authUser
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        methods: {
            pause () {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: false})
                setTimeout(() => this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, leads: true}), 15000)
            },
            deleteComment () {
                this.pause()
                this.$store.dispatch('deleteLeadComment', this.commentToDelete.id)
                    .then(() => {
                        this.$store.dispatch('pushMessage', {
                            text: `Комментарий '${this.commentToDelete.text}' удален`,
                            color: 'green'
                        })
                        this.confirm = false
                    })
            },
            showDeleteConfirm (comment) {
                this.commentToDelete = comment
                this.confirm = true
            },
            addComment () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.pause()
                        this.$store.dispatch('addLeadComment', {
                            lead_id: this.lead.id,
                            text: this.newComment
                        })
                            .then(() => {
                                this.adding = false
                                this.$store.dispatch('pushMessage', {
                                    text: `Добавлен комментарий к заявке с номера ${this.$options.filters.phone(this.lead.phone)}`,
                                    color: 'green'
                                })
                            })
                    })
            },
            activate () {
                this.active = true
            }
        },
        watch: {
            active (val) {
                if (val && !this.comments.length) {
                    this.adding = true
                }
                if (!val) {
                    this.$emit('close')
                }
            },
            adding (val) {
                if (val) {
                    this.newComment = ''
                }
            }
        }
    }
</script>
<style scoped>
    .fat-able:hover {
        color: #263238;
    }
    .clickable {
        cursor: pointer;
        opacity: .8;
    }
    .clickable:hover {
        opacity: 1;
    }
    .round-corner {
        border-radius: 5px;
    }
</style>
