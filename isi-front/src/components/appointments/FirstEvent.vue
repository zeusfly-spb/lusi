<template>
    <v-menu
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            :nudge-right="40"
            :nudge-bottom="-10"
            lazy
            offset-y
            full-width
            min-width="290px"
    >
        <template v-slot:activator="data">
         <span>
            <v-btn
                    flat
                    round
                    outline
                    v-if="!display"
                    :draggable="event.draggable"
                    :title="mainTitle"
                    :style="{
                    'cursor': !event.draggable ? 'pointer' : dragging ? 'grabbing' : 'grab',
                    'min-width': compact ? 0 : '88px',
                    'background-color': `${background}!important`
                }"
                    :ripple="false"
                    :id="`first-${event.id}`"
                    @click="show"
                    @dragstart="dragStart"
                    @dragend="dragEnd"
                    @dragenter="dragEnter"
                    @dragover="dragEnter"
                    @dragleave="dragEnter"
                    @mousedown="dragging = true"
                    @mouseup="dragging = false"
                    @contextmenu.prevent="menu = true; data.on"
            >
                <v-icon
                        :color="colors[event.status]"
                        class="ml-1"
                        :title="`Статус: ${ {active: 'Активна', postponed: 'Отложена', moderate: 'На модерации', completed: 'Завершена', cancelled: 'Отказ'}[event.status] }`"
                >
                    {{ icons[event.status] }}
                </v-icon>
                <span
                        v-if="!compact"
                        class="green--text"
                >
                        {{ $store.state.appointment.displayTime(getTime(event.date)) }}
                    </span>
                <span
                        v-if="!compact"
                        class="blue--text ml-1 mr-1"
                >
                        {{ event.client_name }}
                </span>
                <v-avatar
                        size="28px"
                        class="mr-1"
                        :title="`Исполнитель: ${event.performer && event.performer.full_name || ''}`"
                >
                    <img
                            v-if="event.performer && event.performer.avatar"
                            :src="basePath + event.performer.avatar" alt="Фото"
                            :draggable="false"
                    >
                    <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else :draggable="false">
                </v-avatar>
                <v-avatar
                        size="28px"
                        class="mr-1"
                        :title="`Администратор: ${event.user && event.user.full_name || ''}`"
                >
                    <img
                            v-if="event.user && event.user.avatar"
                            :src="basePath + event.user.avatar" alt="Фото"
                            :draggable="false"
                    >
                    <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else :draggable="false">
                </v-avatar>
            </v-btn>
            <v-expand-x-transition>
                <v-chip
                        disabled
                        outline
                        text-color="black"
                        style="height: 40px; border: 1px solid lightgrey"
                        :style="{'background-color': `${background}!important`}"
                        v-if="display"
                >
                    <event
                            first
                            :event="event"
                            @hide="display = false"
                    />
                    <v-icon
                            small
                            color="grey lighten-1"
                            class="clickable"
                            title="Скрыть подробности"
                            @click="hide"
                    >
                        cancel
                    </v-icon>
                </v-chip>
            </v-expand-x-transition>
        </span>

        </template>
        <event-context-menu-entry
                :event="event"
                @changed="visible = false"
        />
    </v-menu>

</template>
<script>

    import EventContextMenuEntry from './EventContextMenuEntry'
    import Event from './Event'
    export default {
        name: 'FirstEvent',
        props: {
            event: Object,
            compact: {
                type: Boolean,
                default: false
            },
            withinCabinet: {
                type: Boolean,
                default: false
            }
        },
        data: () => ({
            menu: false,
            display: false,
            dragging: false,
            contextMenu: false,
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
            }
        }),
        computed: {
            background () {
                return this.event && this.event.service && this.event.service.highlight && this.$store.getters.colorValue(this.event.service.highlight) || ''
            },
            mainTitle () {
                let details = `Запись на ${this.$moment(this.$store.getters.withoutTZ(this.event.date)).format('D MMMM YYYY г. HH:mm')}`
                return this.compact ? details : 'Показать подробности'
            },
            displayedEvent: {
                get () {
                    return this.$store.state.appointment.displayedEvent
                },
                set (val) {
                    this.$store.commit('SET_DISPLAYED_EVENT', val)
                }
            },
            moveReady () {
                return this.$store.getters.moveReady
            },
            dialogLocked () {
                return this.$store.state.appointment.dialogLocked
            },
            basePath () {
                return this.$store.state.basePath
            }
        },
        methods: {
            getTime (date) {
                if (date.includes('T')) {
                    return date.split('T')[1]
                } else {
                    return date.split(' ')[1]
                }
            },
            dialogLockControl (val) {
                val ? this.$store.commit('LOCK_DIALOG') : this.$store.commit('UNLOCK_DIALOG')
            },
            show () {
                if (this.compact && !this.withinCabinet) {
                    return
                }
                this.$store.commit('SET_DISPLAYED_EVENT', this.event)
                this.display = true
            },
            hide () {
                this.$store.commit('UNSET_DISPLAYED_EVENT')
                this.display = false
            },
            dragEnter (evt) {
                this.$emit('drag-enter', evt)
            },
            dragStart (evt) {
                this.dragging = true
                evt.dataTransfer.setData("Text", this.event.id)
                this.$store.commit('SET_DRAG_EVENT', this.event)
                return false
            },
            dragEnd () {
                this.dragging = false
                if (this.moveReady) {
                    this.$store.dispatch('moveEvent')
                }
            }
        },
        mounted () {
            if (!this.displayedEvent) {
                return
            }
            this.display = +this.displayedEvent.id === +this.event.id
        },
        watch: {
            menu (val) {
                this.dialogLockControl(val)
            }
        },
        components: {
            Event,
            EventContextMenuEntry
        }
    }
</script>
<style scoped>
    .v-chip >>> .v-chip__content {
        padding: 0!important;
    }
    .v-btn{
        text-transform: none!important;
        border: 1px solid lightgrey!important;
    }
    .v-btn__content {
        padding: .5em!important;
        margin: .5em!important;
    }
    .v-btn:hover:before {
        background-color: transparent!important;
        border: 1px solid black;
    }
    .v-btn:focus:before {
        background-color: transparent!important;
        border: 1px solid black;
    }

</style>
