<template>
    <v-layout>
        <v-flex xs12 sm6 md6>
            <v-select
                    :items="users"
                    v-model="selectedUserId"
                    item-text="full_name"
                    item-value="id"
                    single-line
                    outline
                    color="green"
            />
        </v-flex>
        <v-flex>
            <v-btn color="primary" flat dark
                   v-if="selectedUserId"
                   @click="startAnotherUserDay"
                   :title="`Начать рабочий день для сотрудника ${selectedUser && selectedUser.full_name || ''}`"
            >
                Начать рабочий день
            </v-btn>
        </v-flex>
    </v-layout>
</template>

<script>
    export default {
        name: 'WorkdaysAdminPanel',
        data: () => ({
            selectedUserId: null
        }),
        computed: {
            selectedUser () {
                if (!this.selectedUserId) {
                    return null
                }
                return this.users
                    .find(user => +user.id === +this.selectedUserId) || null
            },
            workdays () {
                return this.$store.state.workdays || []
            },
            users () {
                let existsIds = this.$store.state.workdays
                    .map(workday => +workday.user_id)
                let base = this.$store.state.users
                    .filter(user => !existsIds.includes(user.id))
                    .filter(user => !user.is_admin)
                    .filter(item => !item.is_admin && !item.fired_at && !item.is_superadmin)
                let empty = {
                    full_name: 'Выберите сотрудника, чтобы начать рабочий день',
                    id: null
                }
                return [empty, ...base]
            }
        },
        methods: {
            startAnotherUserDay () {
                this.$store.dispatch('startAnotherUserDay', {
                    user_id: this.selectedUserId,
                    island_id: this.$store.getters.workingIslandId
                })
                    .then(() => this.selectedUserId = null)
            }
        }
    }
</script>

<style scoped>
</style>
