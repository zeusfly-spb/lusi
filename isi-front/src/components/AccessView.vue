<template>
    <v-layout align-center justify-center row fill-height>
        <v-flex xs12 md3 class="grey lighten-4">
            <v-container class="text-xs-center">
                <v-card flat v-if="access && access.status === 'none'">
                    <v-card-title primary-title>
                        <h4 class="red--text">Доступ запрещен</h4>
                    </v-card-title>
                    <v-form>
                        <v-text-field prepend-icon="lock_open"
                                      label="Комментарий"
                                      v-model="comment"
                                      @keyup.enter="sendRequest"
                        />
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn primary @click="sendRequest">Запросить доступ</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card>
                <v-card flat v-if="access && access.status === 'requested'">
                    <div class="title">Запрос отправлен</div>
                    <div class="title red--text">Ожидайте получения доступа</div>
                </v-card>
                <v-card flat v-if="access && access.status === 'denied'">
                    <div class="headline red--text">Доступ запрещен!</div>
                </v-card>
                <v-card flat v-if="access && access.status === 'allowed' && !permittedIsland">
                    <div class="headline red--text">Отсутствует доступ к островку данного устройства!</div>
                </v-card>

                <v-card flat v-if="!(access && access.status)">
                    Проверка доступа
                    <v-progress-circular
                        indeterminate
                    />
                </v-card>

            </v-container>
        </v-flex>

    </v-layout>
</template>

<script>
    export default {
        name: 'AccessView',
        data: () => ({
            comment: ''
        }),
        computed: {
            permittedIsland () {
                return this.userIslandsIds.includes(this.access.island_id) || this.authUser.logist
            },
            userIslandsIds () {
                return this.authUser.islands.length && this.authUser.islands.map(item => item.id) || []
            },
            authUser () {
                return this.$store.state.authUser
            },
            access () {
                return this.$store.state.access
            }
        },
        methods: {
            sendRequest () {
                this.axios.post('/api/create_access_request', {
                    user_id: this.authUser.id,
                    comment: this.comment
                })
                    .then(res => {
                        this.$store.commit('SET_DEVICE_ID', res.data.device_id)
                        this.$store.dispatch('checkAccess')
                    })
            }
        },
        watch: {
            'access.status' (val) {
                if (val !== 'allowed') {
                    this.$router.push('/access')
                }
            },
            access (value) {
                if (value && value.status === 'allowed' && this.permittedIsland) {
                    this.$store.dispatch('enterCRM')
                    this.$router.push({path: '/daily', query: this.$route.query})
                }
            }
        },
        created () {
            if (!this.$store.getters.logist)
                setInterval(() => this.$store.dispatch('checkAccess'), 5000)
        }
    }
</script>
