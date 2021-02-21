<template>
    <v-layout>
        <v-layout
            v-if="active"
        >
            <v-text-field
                    v-if="active"
                    class="ml-2 mr-2"
                    autofocus
                    label="Комментарий"
                    v-model="newCommentText"
                    data-vv-name="text"
                    data-vv-as="Текст комментария"
                    :error-messages="errors.collect('text')"
                    v-validate="'required'"
                    @keyup.esc.stop="deactivate"
                    @keyup.enter="saveNewComment"
            />
                <v-btn
                        small
                        icon
                        title="Сохранить"
                        class="control"
                        @click="saveNewComment"
                >
                    <v-icon
                            color="green"
                    >
                        save
                    </v-icon>
                </v-btn>
                <v-btn
                        small
                        icon
                        title="Сохранить"
                        @click="saveNewComment"
                        class="control"
                >
                    <v-icon
                            color="red"
                            title="Отменить"
                            @click="deactivate"
                    >
                        cancel
                    </v-icon>
                </v-btn>
        </v-layout>
        <v-btn
            v-else
            icon
            small
            title="Добавить комментарий"
            @click="activate"
        >
            <v-icon
                title="Добавить комментарий"
                color="green"
            >
                add_circle_outline
            </v-icon>
        </v-btn>
    </v-layout>
</template>
<script>
    export default {
        name: 'EventCommentAdder',
        props: {
            event: Object,
            value: Boolean,
        },
        data: () => ({
            newCommentText: ''
        }),
        computed: {
            empty () {
                return !this.comments || !this.comments.length
            },
            comments () {
                return this.event && this.event.comments
            },
            active: {
                get () {
                    return this.value
                },
                set (val) {
                    this.$emit('input', val)
                }
            }
        },
        methods: {
            saveNewComment () {
                this.$validator.validate()
                .then(res => {
                    if (!res) {
                        return
                    }
                    this.$store.dispatch('addEventComment', {
                        event_id: this.event.id,
                        text: this.newCommentText
                    })
                        .then(() => {
                            this.deactivate()
                            this.$store.dispatch('pushMessage', {
                                text: 'К записи добавлен комментарий',
                                color: 'green'
                            })
                        })
                })
            },
            deactivate () {
                this.active = false
            },
            activate () {
                this.active = true
            }
        },
        mounted () {
            setTimeout(() => this.empty ? this.activate() : null, 300)
        },
        watch: {
            active () {
                this.newCommentText = ''
            }
        }
    }
</script>
<style scoped>
    .control {
        display: inline!important;
        margin: 0!important;
        padding: 0!important;
    }
</style>
