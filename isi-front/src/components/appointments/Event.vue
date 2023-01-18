<template>
        <div
            class="mb-0 pb-0 event"
            :draggable="event.status !== 'completed'"
            style="cursor: grab"
            :class="{'teal lighten-4': mouseOver && !first, 'ml-2': first}"
            :title="caption"
            @mouseover="mouseOver = true"
            @mouseleave="mouseOver = false"
            @dragstart="dragStart"
            @dragend="dragEnd"
        >
            <v-icon
                :color="`${ colors[event.status] }`"
                :title="`Статус: ${ {active: 'Активна', postponed: 'Отложена', moderate: 'На модерации', completed: 'Завершена', cancelled: 'Отказ'}[event.status] }`"
            >
                {{   `${ icons[event.status]}` }}
            </v-icon>
            <span class="green--text title">{{ $store.state.appointment.displayTime(timePart(event.date)) }}</span>
            <span class="pl-1 pr-1">{{ event.service && event.service.description }}</span>
            <strong>Клиент:</strong>
            <span class="pl-1 pr-1">
                {{ event.client_name }}
            </span>
            {{ event.client_phone | phone }}
            <caller :phone="event.client_phone"/>
            &nbsp;
            &nbsp;
            &nbsp;
            <div
                class="mr-2"
            >
                <v-avatar
                        size="36px"
                        :title="`Исполнитель: ${event.performer.full_name}`"
                >
                    <img :src="basePath + event.performer.avatar" alt="Фото" v-if="event.performer.avatar"
                         :draggable="false"
                    >
                    <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else :draggable="false">
                </v-avatar>
            </div>
            <div>
                <v-avatar
                        size="36px"
                        :title="`Администратор: ${event.user.full_name}`"
                >
                    <img :src="basePath + event.user.avatar" alt="Фото" v-if="event.user.avatar"
                         :draggable="false"
                    >
                    <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-else :draggable="false">
                </v-avatar>
            </div>
            <v-spacer/>
            <event-control-chip
                :event="{...event, first: first}"
            />
        </div>
</template>
<script>
    import Caller from '../leads/Caller'
    import EventControlChip from './EventControlChip'
    export default {
        name: 'Event',
        props: {
            event: Object,
            first: Boolean
        },
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
            mouseOver: false,
            eventToDelete: null,
            editMode: false
        }),
        computed: {
            displayedEvent () {
                return this.$store.state.appointment.displayedEvent
            },
            draggedEvent () {
                return this.$store.state.appointment.draggedEvent
            },
            dragTarget () {
                return this.$store.state.appointment.dragTarget
            },
            caption () {
                return `Запись на ${this.$moment(this.event.date).format('D MMMM YYYY г. HH:mm')}`
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            basePath () {
                return this.$store.state.basePath
            }
        },
        methods: {
            timePart (date) {
                if (date.includes('T')) {
                    return date.split('T')[1]
                } else {
                    return date.split(' ')[1]
                }
            },
            dragEnd () {
                if (this.$store.getters.moveReady) {
                    this.$store.dispatch('moveEvent')
                }
            },
            dragStart (evt) {
                evt.dataTransfer.setData("Text", this.event.id)
                this.$store.commit('SET_DRAG_EVENT', this.event)
                return false
            }
        },
        watch: {
            displayedEvent (val) {
                !val || val.id !== this.event.id ? this.$emit('hide') : null
            }
        },
        components: {
            Caller,
            EventControlChip
        }
    }
</script>
<style>
    .event {
        display: flex;
        align-items: center;
    }
</style>
