<template>
    <span>
        <v-icon
            color="red"
            class="clickable"
            @click="showConfirm"
        >
            close
        </v-icon>
        <v-dialog
            v-if="confirm"
            max-width="600px"
            v-model="confirm"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                        class="red darken-3"
                >
                    <span
                        class="title white--text"
                    >
                        Подтвержение
                    </span>
                </v-card-title>
                <v-card-text>
                    <span
                        class="title"
                    >
                        Удалить комментарий "<span class="comment-text">{{ comment.text }}</span>"?
                    </span>
                </v-card-text>
                <v-card-actions>
                     <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="hideConfirm">Отмена</v-btn>
                    <v-btn
                        color="red darken-1"
                        flat
                        :disabled="process"
                        @click="deleteComment"
                    >
                        Удалить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </span>
</template>
<script>
    export default {
        name: 'EventCommentRemover',
        props: ['event', 'comment'],
        data: () => ({
            process: false,
            confirm: false
        }),
        methods: {
            deleteComment () {
                this.process = true
                this.$store.dispatch('deleteEventComment', {
                    event_id: this.event.id,
                    comment_id: this.comment.id
                })
                    .then(() => {
                        this.hideConfirm()
                        this.$store.dispatch('pushMessage', {
                            text: `Комментарий от ${this.$moment(this.comment.created_at).format('D MMMM YYYY г. HH:mm')} удален`,
                            color: 'green'
                        })
                    })
                    .finally(() => this.process = false)
            },
            hideConfirm () {
                this.confirm = false
            },
            showConfirm () {
                this.confirm = true
            }
        }
    }
</script>
<style scoped>
    .comment-text {

    }
</style>
