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
                        :color="{active: 'blue', cancelled: 'red', completed: 'green'}[event.status]"
                    >
                        {{ {active: 'event', completed: 'event_available', cancelled: 'event_busy'}[event.status] }}
                    </v-icon>
                    <span
                        class="green--text body-2 mr-1"
                    >
                                <strong>{{ event.date | moment('DD MMM YYYY г. HH:mm')}}</strong>
                            </span>
                    <span
                        class="body-2"
                    >
                                <strong>
                                    {{ event.client_name }}
                                </strong>
                            </span>
                </v-list-tile-title>
            </v-list-tile>
            <v-divider/>
            <v-list-tile
                v-for="(item, index) in contextMenuItems"
                :disabled="item.disabled"
                :key="index"
                :title="can(item.action) ? '' : 'Невозможно выполнить операцию'"
                @click="can(item.action) ? performAction(item.action) : null"
            >
                <v-list-tile-title
                    :class="{disabled: !can(item.action)}"
                >
                    <span class="body-2 right">
                        {{ item.title }}
                    </span>
                    <v-icon
                        :class="{disabled: !can(item.action) }"
                        :color="colors[item.action]"
                    >
                        {{ `${ icons[item.action] }`  }}
                    </v-icon>
                </v-list-tile-title>
            </v-list-tile>
            <v-divider/>
            <v-list-tile
                v-for="(item, index) in commonItems"
                :key="$store.state.appointment.uniqID(index)"
                @click="commonAction(item.action)"
            >
                <v-list-tile-title
                    :class="{disabled: !can(item.action) }"
                >
                    <span class="body-2 right">
                        {{ item.title }}
                    </span>
                    <v-icon
                        :color="item.color"
                    >
                        {{ item.icon  }}
                    </v-icon>
                </v-list-tile-title>
            </v-list-tile>
        </v-list>
    </div>
</template>
<script>
    const clearDate = datetime => datetime.includes('T') ? datetime.split('T')[0] : datetime.split(' ')[0]
    export default {
        name: 'EventContextMenuEntry',
        props: ['event'],
        data: () => ({
            colors: {
                active: 'blue',
                postponed: 'amber',
                moderate: 'orange',
                cancelled: 'red',
                completed: 'green'
            },
            icons: {
                active: 'event',
                postponed: 'timelapse',
                moderate: 'assignment_late',
                cancelled: 'event_busy',
                completed: 'event_available'
            },
            contextMenuRaw: [
                {title: 'Сменить статус на "Выполнено"', action: 'completed'},
                {title: 'Сменить статус на "Отказ"', action: 'cancelled'},
                {title: 'Сменить статус на "Активно"', action: 'active'},
                {title: 'Сменить статус на "Отложено"', action: 'postponed'},
                {title: 'Сменить статус на "На модерации"', action: 'moderate'},
            ],
            commonItems: [
                {title: 'Редактировать', action: 'edit', icon: 'edit', color: 'blue'},
                {title: 'Удалить', action: 'delete', icon: 'delete', color: 'red'}
            ]
        }),
        computed: {
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            contextMenuItems () {
                const today = () => this.event && clearDate(this.event.date) === this.$store.getters.realDate || false
                let base = this.contextMenuRaw
                if (!this.isSuperadmin) {
                    base = base.filter(item => item.action !== 'cancelled')
                }
                base = base.map(item => ({
                    ...item,
                    disabled: !today() && item.action === 'completed'
                }))
                base = base.filter(item => item.action !== this.event.status)
                return base
            }
        },
        methods: {
            commonAction (val) {
                switch (val) {
                    case 'edit':
                        this.$store.commit('SET_EDITED_EVENT', this.event)
                        break
                    case 'delete':
                        this.$store.commit('ATTEMPT_TO_DELETE_EVENT', this.event)
                        break
                    default: break
                }
                this.$emit('changed')
            },
            dialogLockControl (val) {
                val ? this.$store.commit('LOCK_DIALOG') : this.$store.commit('UNLOCK_DIALOG')
            },
            performAction (action) {
                if (action === 'completed') {
                    this.$emit('changed')
                    this.$store.commit('SET_EVENT_TO_DONE', this.event)
                    this.$store.commit('SET_EVENT_DONE_CONFIRM', true)
                    return
                }
                const info = {
                    active: 'Активна',
                    postponed: 'Отложена',
                    moderate: 'На модерации',
                    cancelled: 'Отменена',
                    completed: 'Выполнена'
                }
                this.$store.dispatch('changeEventStatus', {
                    event_id: this.event.id,
                    status: action
                })
                    .then(() => {
                        this.$emit('changed')
                        let text = `Статус записи изменен на ${info[action]}`
                        this.$store.commit('SEND_EVENT_MESSAGE', {color: 'green', text: text})
                    })
            },
            can (action) {
                return this.event.status !== action
            }
        }
    }
</script>
