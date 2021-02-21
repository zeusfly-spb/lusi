<template>
    <v-flex>
        <div
            :title="`Изменить список доступных островков пользователя ${user.full_name}`"
            @click="activate"
            :class="{'grey--text': active}"
            class="clickable"
        >
            <div v-for="island in userIslands" :key="island.id">
                {{ island.name }}
            </div>
        </div>
        <v-dialog
            v-model="active"
            max-width="800px"
        >
            <v-card class="round-corner">
                <v-card-title
                    class="light-blue darken-3"
                    style="height: 3em; padding: 0 1em"
                >
                    <span class="subheading white--text">
                        Доступные островки для пользователя <strong>{{ user.full_name }}</strong>
                    </span>
                    <v-spacer/>
                    <v-icon
                        class="clickable"
                        @click="deactivate"
                        color="white"
                        title="Закрыть"
                    >
                        close
                    </v-icon>
                </v-card-title>
                <v-card-text
                    class="dense"
                >
                    <v-checkbox
                        v-for="(item, index) in islands"
                        :key="index"
                        v-model="item.accepted"
                        :label="item.name"
                        @change="checkForChanges"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="active = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat
                           @click="updateIslands"
                           :disabled="!changed"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'UserIslandsColumn',
        props: ['user'],
        data: () => ({
            active: false,
            backup: null,
            changed: false
        }),
        computed: {
            userIslandsIds () {
                return this.userIslands.map(item => item.id)
            },
            userIslands () {
                return this.user && this.user.islands.length && this.user.islands || [{name: 'нет'}]
            },
            islands () {
                let base = this.$store.state.islands
                return base.map(item => ({... item, accepted: this.userIslandsIds.length && this.userIslandsIds.includes(item.id) || false}))
            }
        },
        methods: {
            checkForChanges () {
                    this.changed = this.backup !== JSON.stringify(this.islands)
            },
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            },
            updateIslands () {
                this.$store.dispatch('updateUserIslands', {
                    user_id: this.user.id,
                    island_ids: this.islands.filter(item => item.accepted).map(item => item.id)
                })
                    .then(() => {
                        this.deactivate()
                        this.$emit('success', `Изменен список доступных островков сотрудника ${this.user.full_name}`)
                    })
            }
        },
        watch: {
            active (val) {
                if (val) this.backup = JSON.stringify(this.islands)
            }
        }
    }
</script>
<style>
    .dense {
        padding: 0 1em;
    }
</style>
