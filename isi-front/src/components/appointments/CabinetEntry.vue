<template>
    <div
        class="cabinet-entry"
        :class="{'target': draggingOver && moveReady}"
        :style="{width: entryWidth, height: `${fieldHeight}px`}"
        :title="`Добавить запись на ${hour}:__ в кабинет ${cabinet.name}`"
        @click.self="bodyClicked"
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @dragover="dragOver"
        v-on:drop="dragDrop"
    >
        <first-event
            within-cabinet
            :compact="!contentOpen && !!$store.state.appointment.openCabinetId || !$store.state.appointment.displayedEvent || contentOpen && $store.state.appointment.displayedEvent.id !== event.id"
            v-for="(event, index) of events"
            :key="index"
            :event="event"
        />
    </div>
</template>
<script>
    import Event from './Event'
    import FirstEvent from './FirstEvent'
    export default {
        name: 'CabinetEntry',
        props: ['cabinet', 'events', 'date', 'hour', 'fieldWidth', 'fieldHeight'],
        data: () => ({
            draggingOver: false,
            dropped: false,
            canDrop: false,
            firstDragging: false,
            firstDisplayed: false,
            listDisplayed: false,
            statsRaw: [
                {status: 'active', color: 'blue', icon: 'event', title: 'Сменить статус на "Активно"'},
                {status: 'completed', color: 'green', icon: 'event_available', title: 'Сменить статус на "Выполнено"'},
                {status: 'cancelled', color: 'red', icon: 'event_busy', title: 'Сменить статус на "Отказ"'},
                {status: 'moderate', color: 'amber darken-3', icon: 'assignment_late', title: 'Сменить статус на "Модерация"'},
                {status: 'postponed', color: 'orange accent-4', icon: 'timelapse', title: 'Сменить статус на "Отложена"'}
            ]
        }),
        computed: {
            entryWidth () {
                let openCabWd = this.$store.state.appointment.openCabinetWidth + 'px'
                return this.contentOpen ? openCabWd : `${this.fieldWidth}px`
            },
            contentOpen () {
                const value = () => this.cabinet.id === this.$store.state.appointment.openCabinetId
                return this.cabinet && this.cabinet.id ? value() : false
            },
            firstEventIcon () {
                if (!this.firstEvent) {
                    return null
                }
                let target = this.statsRaw.find(item => item.status === this.firstEvent.status)
                return {
                    icon: target.icon,
                    color: target.color
                }
            },
            moveReady () {
                return this.$store.getters.moveReady
            },
            dragTarget () {
                return this.$store.state.appointment.dragTarget
            },
            draggedEvent () {
                return this.$store.state.appointment.draggedEvent
            },
            eventToDelete () {
                return this.$store.state.appointment.eventToDelete
            },
            displayTime () {
                return this.$store.state.appointment.displayTime
            },
            hasMultiplyEvents () {
                return this.hasEvents && this.events.length > 1
            },
            hasEvents () {
                return this.events.length
            },
            firstEvent () {
                return this.events[0]
            }
        },
        methods: {
            dragOver (evt) {
                evt.preventDefault()
            },
            dragDrop (evt) {
                evt.preventDefault()
                evt.dataTransfer.dropEffect = "move"
                this.draggingOver = false
            },
            dragEnter (evt) {
                this.draggingOver = true
                this.$store.commit('SET_DRAG_TARGET', {
                    cabinet: this.cabinet,
                    cabinet_id: this.cabinet && this.cabinet.id || null,
                    date: this.date,
                    hour: this.hour
                })
                evt.dataTransfer.effectAllowed = "move"
            },
            dragLeave (evt) {
                evt.preventDefault()
                this.draggingOver = false
            },
            firstDragStart (evt) {
                evt.dataTransfer.setData("Text", this.firstEvent.id)
                this.firstDragging = true
                this.$store.commit('SET_DRAG_EVENT', this.firstEvent)
                return false
            },
            firstDragEnd () {
                this.dropped = true
                this.firstDragging = false
                if (this.moveReady) {
                    this.$store.dispatch('moveEvent')
                }
            },
            emitAddAttempt () {
                this.$emit('addAttempt', this.cabinet)
            },
            bodyClicked () {
                this.$emit('fieldClicked', this.cabinet)
            }
        },
        watch: {
            hasMultiplyEvents (val) {
                if (!val) {
                    this.listDisplayed = false
                }
            },
            firstDisplayed (val) {
                val ? this.$store.commit('LOCK_DIALOG') : this.$store.commit('UNLOCK_DIALOG')
            },
            listDisplayed (val) {
                val ? this.$store.commit('LOCK_DIALOG') : this.$store.commit('UNLOCK_DIALOG')
            }
        },
        components: {
            Event,
            FirstEvent
        }
    }
</script>
<style scoped>
    .target {
        border: 3px solid green!important;
    }
    .cabinet-entry {
        padding: 0;
        margin: 0;
        border: 1px solid lightgray;
        display: flex;
        cursor: pointer;
        justify-content: flex-start;
        align-items: center;
        overflow: hidden;
    }
</style>
