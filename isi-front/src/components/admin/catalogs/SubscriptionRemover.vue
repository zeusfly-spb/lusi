<template>
    <v-flex>
        <v-dialog
            v-model="dialog"
            max-width="500"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="red"
                >
                    <span
                        class="white--text title"
                    >
                        Удаление абонемента
                    </span>
                    <v-spacer/>
                    <v-icon
                        class="clickable"
                        color="white"
                        title="Отмена"
                        @click="hide"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text>
                    Подтвердите удаление абонемента <strong>{{ toDelete && toDelete.name || '' }}</strong>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="hide">Отмена</v-btn>
                    <v-btn color="red darken-1" flat @click="deleteSubscription">Удалить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>

<script>
    export default {
        name: 'SubscriptionRemover',
        data: () => ({
            dialog: false
        }),
        computed: {
            toDelete () {
                return this.$store.state.catalog.subscriptionToDelete
            }
        },
        methods: {
            deleteSubscription () {
                this.$store.dispatch('deleteSubscription', this.toDelete)
                    .then(() => this.hide())
            },
            show () {
                this.dialog = true
            },
            hide () {
                this.$store.commit('UNSET_SUBSCRIPTION_TO_DELETE')
                this.dialog = false
            }
        },
        watch: {
            toDelete (val) {
                val ? this.show() : this.hide()
            }
        }
    }
</script>

<style scoped>

</style>
