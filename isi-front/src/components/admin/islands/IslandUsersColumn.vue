<template>
    <div>
        <div v-for="(user, index) in islandUsers"
             :key="index"
             :class="{'grey--text': active}"
             @click="activate"
             title="Изменить список сотрудников островка"
             class="clickable"
        >
            <v-avatar
                size="30px"
                :key="user.id"
                style="margin-bottom: .2em"
            >
                <img :src="`${basePath}${user.avatar ? user.avatar : '/img/default.jpg'}`"
                     alt="Фото"
                     :title="user.full_name"
                />
            </v-avatar>

            {{ user.full_name }}
        </div>
        <div v-if="!islandUsers.length"
             @click="activate"
             title="Изменить список сотрудников островка"
             style="cursor: pointer"
        >
            нет
        </div>
        <v-dialog
            v-model="active"
            max-width="800px"
        >
            <v-card class="round-corner">
                <v-card-title
                    class="light-blue darken-3"
                    style="height: 2em; padding: 0 1em"
                >
                    <span class="subheading white--text">
                        Сотрудники островка <strong>{{ island.name }}</strong>
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
                        v-for="(item, index) in users"
                        :key="index"
                        v-model="item.accepted"
                        :label="item.full_name"
                        @change="checkForChanges"
                    />

                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-btn color="darken-1" flat @click="active = false">Отмена</v-btn>
                    <v-btn color="green darken-1" flat
                           @click="updateUsers"
                           :disabled="!changed"
                    >
                        Сохранить
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<script>
    export default {
        name: 'IslandUsersColumn',
        props: ['island'],
        data: () => ({
            active: false,
            changed: false,
            backup: null
        }),
        computed: {
            islandUsersIds () {
                return this.island.users.map(item => item.id) || []
            },
            users () {
                let base = this.$store.state.users
                base = base.filter(user => !user.fired_at && !user.is_superadmin)
                return base.map(item => ({... item, accepted: this.islandUsersIds.length && this.islandUsersIds.includes(item.id) || false }))
            },
            basePath () {
                return this.$store.state.basePath
            },
            islandUsers () {
                return this.island && this.island.users
            }
        },
        methods: {
            checkForChanges () {
                this.changed = this.backup !== JSON.stringify(this.users)
            },
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            },
            updateUsers () {
                this.$store.dispatch('updateIslandUsers', {
                    island_id: this.island.id,
                    user_ids: this.users.filter(item => item.accepted).map(item => item.id)
                })
                    .then(() => {
                        this.deactivate()
                        this.$emit('success', `Изменен список сотрудников островка ${this.island.name}`)
                    })
            }
        },
        watch: {
            active (val) {
                if (val) this.backup = JSON.stringify(this.users)
            }
        }
    }
</script>
