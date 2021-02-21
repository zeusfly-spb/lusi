<template>
    <div class="context-menu">
        <v-list
                dense
                class="list-style"
        >
            <v-list-tile
                    class="teal lighten-5 main-list-tile"
            >
                <v-list-tile-title>
                    <v-icon
                            class="mr-2"
                            :color="{process: 'blue', moderate: 'red', done: 'green'}[lead.status]"
                    >
                        {{ {process: 'assignment', done: 'assignment_turned_in', moderate: 'assignment_late'}[lead.status] }}
                    </v-icon>
                    <span
                            class="green--text body-2 mr-1"
                    >
                                <strong>{{ lead.created_at | moment('DD MMM YYYY г. HH:mm')}}</strong>
                            </span>
                    <span
                        class="body-2"
                    >
                        <strong>
                            {{ lead.name }}
                        </strong>
                    </span>
                </v-list-tile-title>
            </v-list-tile>
            <v-divider/>
            <v-list-tile
                v-for="(item, index) in items"
                :key="index"
                @click="performAction(item.action)"
            >
                <v-list-tile-title
                    :class="{'unavailable': !available(item.action)}"
                    :title="!workingIsland ? 'Чтобы добавить запись, выберите островок назначения' : `Добавить запись на островок ${workingIsland.name}`"
                >
                     <span
                         class="body-2 right"
                     >
                         {{ item.title }}
                     </span>
                    <v-icon
                        :color="available(item.action) ? item.color : 'grey'"
                    >
                        {{ item.icon }}
                    </v-icon>
                </v-list-tile-title>
            </v-list-tile>
        </v-list>
    </div>
</template>
<script>
    export default {
        name: 'LeadContextMenuEntry',
        props: ['lead'],
        data: () => ({
            itemsRaw: [
                {title: 'Добавить запись по заявке', action: 'add_record', icon: 'event', color: 'blue'}
            ]
        }),
        computed: {
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            items () {
                return this.lead.status !== 'done' ? this.itemsRaw : []
            }
        },
        methods: {
            available (action) {
                switch (action) {
                    case 'add_record':
                        if (!this.workingIsland) {
                            return false
                        }
                        return true
                        break
                    default:
                        return true
                }

            },
            performAction (action) {
                if (!this.available(action)) {
                    return
                }
                switch (action) {
                    case 'add_record':
                        this.$store.commit('SET_ATTEMPT_TO_EVENT', this.lead)
                        break
                }
                this.$emit('done')
            }
        }
    }
</script>
<style scoped>
    .unavailable {
        color: grey;
        cursor: default;
    }
    .main-list-tile {
        margin: 0!important;
        padding: 0!important;
    }
    .context-menu {
        background-color: white!important;
        cursor: default;
    }
    .list-style {
        margin: 0!important;
        padding: 0!important;
    }
</style>
