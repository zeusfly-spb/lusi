<template>
    <v-flex>
        <v-icon
            title="Присвоить статус 'В работе'"
            v-show="status !== 'process'"
            class="green--text clickable"
            @click="showConfirm('process')"
        >
            offline_pin
        </v-icon>
        <v-icon
            title="Присвоить статус 'На модерации'"
            v-show="status !== 'moderate'"
            class="blue--text clickable"
            @click="showConfirm('moderate')"
        >
            offline_bolt
        </v-icon>
        <v-icon
            title="Присвоить статус 'Завершено'"
            v-show="status !== 'done' && canClose"
            class="red--text clickable"
            @click="showConfirm('done')"
        >
            remove_circle
        </v-icon>
        <v-dialog
            v-model="active"
            max-width="800"
        >
            <v-card
                class="round-border"
            >
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Комментарий к смене статуса</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        v-if="active"
                        autofocus
                        v-model="newComment"
                        @keyup.esc="this.active = false"
                        @keyup.enter="updateStatus"
                        data-vv-as="Комментарий"
                        data-vv-name="comment"
                        :error-messages="errors.collect('comment')"
                        v-validate="'required'"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="active = false">Отмена</v-btn>
                    <v-btn color="green darken-1"
                           flat
                           @click="updateStatus"
                    >
                        Сменить статус
                    </v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>
    </v-flex>
</template>

<script>
    export default {
        name: 'LeadStatus',
        props: ['lead'],
        data: () => ({
            newComment: '',
            active: false,
            statusToSet: null
        }),
        computed: {
            status () {
                return this.lead.status
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            canClose () {
                return this.isSuperadmin
            }
        },
        methods: {
            showConfirm (status) {
                this.statusToSet = status
                this.active = true
            },
            updateStatus () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('updateLeadStatus', {
                            lead_id: this.lead.id,
                            status: this.statusToSet,
                            comment: this.newComment
                        })
                            .then(() => {
                                this.active = false
                                this.$store.dispatch('pushMessage', {
                                    text: `Статус заявки с номера ${this.$options.filters.phone(this.lead.phone)} изменен`,
                                    color: 'green'
                                })
                            })
                    })
            }
        },
        watch: {
            active (val) {
                if (val) {
                    this.newComment = ''
                }
            }
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
        opacity: .75;
    }
    .clickable:hover {
        opacity: 1;
    }
    .round-border {
        border-radius: 5px;
    }
</style>
