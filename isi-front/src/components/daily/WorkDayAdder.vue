    <template>
    <v-flex>
        <v-btn
            flat
            color="primary"
            @click="active = true"
            :disabled="!workingIslandId"
        >
            Добавить рабочий день
        </v-btn>
        <v-dialog
            v-model="active"
            max-width="800px"
        >
            <v-card class="round-corner">
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Добавить рабочий день на {{ accountingDate | moment('DD MMMM YYYY г.') }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm8 m8>
                                <v-select
                                    label="Сотрудник"
                                    v-model="currentUserId"
                                    :items="users"
                                    item-text="full_name"
                                    item-value="id"
                                    single-line
                                    data-vv-name="user"
                                    data-vv-as="Сотрудник"
                                    :error-messages="errors.collect('user')"
                                    v-validate="'required'"
                                    style="height: 1em"
                                />
                            </v-flex>
                            <v-flex xs12 sm4 md4>
                                <v-text-field
                                    v-model="workingHours"
                                    label="Количество часов"
                                    data-vv-as="Количество часов"
                                    data-vv-name="hours"
                                    :error-messages="errors.collect('hours')"
                                    v-validate="'required|decimal'"
                                />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="active=false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="saveWorkDay">
                        Добавить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'WorkDayAdder',
        data: () => ({
            active: false,
            currentUserId: null,
            workingHours: ''
        }),
        computed: {
            accountingDate () {
                return this.$store.state.accountingDate
            },
            fixedUserIds () {
                return this.workdays && this.workdays.map(workday => +workday.user_id)
            },
            users () {
                return this.$store.state.users.filter(item => !item.fired_at && !item.is_superadmin && !this.fixedUserIds.includes(+item.id))
            },
            workdays () {
                return this.$store.state.workdays
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            }
        },
        methods: {
            saveWorkDay () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('addWorkDay', {
                            user_id: this.currentUserId,
                            working_hours: this.workingHours,
                            island_id: this.$store.state.workingIslandId
                        })
                            .then(() => {
                                this.active = false
                                this.$emit('snack', 'Добавлен рабочий день', 'green')
                            })
                    })
            }
        },
        watch: {
            active (val) {
                if (val) {
                    [this.currentUserId, this.workingHours] = [null, '']
                }
            }
        }
    }
</script>
<style scoped>
    .round-corner {
        border-radius: 5px;
    }
</style>
