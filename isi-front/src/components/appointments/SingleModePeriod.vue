<template>
    <div
        class="single-mode-period"
        :class="{'target': canDrop}"
        :style="{height: `${$parent.intervalHeight}px`}"
        :title="`Добавить запись на ${textDate} в ${hour}:**`"
        @click.self="periodClicked"
        @dragenter="dragEnter"
        @dragover="dragOver"
        @dragleave="dragLeave"
        @drop="dragDrop"
    >
        <first-event
            v-for="(event, index) in events"
            :key="`${index}-${event.id}`"
            :event="event"
            @drag-enter="dragEnter"
        />
        <calendar-record-adder
            can-subscribe
            v-if="addMode"
            :date-prop="date"
            :preset-hour="hour"
            @reset="addMode = false"
        />
    </div>
</template>
<script>
    import Event from './Event'
    import CalendarRecordAdder from './CalendarRecordAdder'
    import FirstEvent from './FirstEvent'
    export default {
        name: 'SingleModePeriod',
        props: {
            date: String,
            hour: Number,
            cabinetId: {
                type: String,
                default: null
            }
        },
        data: () => ({
            draggingOver: false,
            addMode: false,
            display: false,
            periodDisplay: false
        }),
        computed: {
            moveReady () {
                return this.$store.getters.moveReady
            },
            canDrop () {
                return this.draggingOver && +this.draggedEvent.hour !== +this.hour
            },
            draggedEvent () {
                return this.$store.state.appointment.draggedEvent
            },
            dialogLocked () {
                return this.$store.state.appointment.dialogLocked
            },
            deleteMode () {
                return this.$store.state.appointment.deleteMode
            },
            textDate () {
                return this.$moment(this.date).format('DD MMMM YYYY г.')
            },
            appointments () {
                return this.$store.state.appointment.appointments
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            events () {
                const relevantDate = event => {
                    if (event.date.includes('T')) {
                        return event.date && event.date.split('T')[0] === this.date || false
                    } else {
                        return event.date && event.date.split(' ')[0] === this.date || false
                    }
                }
                const relevantHour = event => {
                    if (event.date.includes('T')) {
                        return event.date && event.date.split('T')[1] && +event.date.split('T')[1].split(':')[0] === +this.hour || false
                    } else {
                        return event.date && event.date.split(' ')[1] && +event.date.split(' ')[1].split(':')[0] === +this.hour || false
                    }
                }
                const compareHour = (item) => relevantDate(item) && relevantHour(item)
                const extend = (base) => {
                    base.draggable = base.status !== 'completed'
                    base.icon = {
                        type: {active: 'event', cancelled: 'event_busy', completed: 'event_available'}[base.status],
                        color: {active: 'blue', cancelled: 'red', completed: 'green'}[base.status]
                    }
                    return base
                }
                let base = this.appointments && this.appointments
                    .filter(item => compareHour(item)) || []
                if (this.cabinetId) {
                    base = base.filter(item => item.cabinet_id === this.cabinetId)
                }
                return base
                    .sort(this.$store.state.appointment.sortByDateTime)
                    .map(item => extend(item))
            }
        },
        methods: {
            dialogLockControl (val) {
                val ? this.$store.commit('LOCK_DIALOG') : this.$store.commit('UNLOCK_DIALOG')
            },
            dragDrop (evt) {
                evt.preventDefault()
                evt.dataTransfer.dropEffect = "move"
                this.draggingOver = false
            },
            firstDragEnd () {
                this.firstDragging = false
                if (this.moveReady) {
                    this.$store.dispatch('moveEvent')
                }
            },
            dragLeave (evt) {
                evt.preventDefault()
                this.draggingOver = false
            },
            dragOver (evt) {
                evt.preventDefault()
            },
            dragEnter (evt) {
                this.draggingOver = true
                this.$store.commit('SET_DRAG_TARGET', {
                    cabinet: null,
                    cabinet_id: this.cabinetId,
                    date: this.date,
                    hour: this.hour
                })
                evt.dataTransfer.effectAllowed = "move"
            },
            firstDragStart (evt) {
                this.firstDragging = true
                evt.dataTransfer.setData("Text", this.firstEvent.id)
                this.$store.commit('SET_DRAG_EVENT', this.firstEvent)
                return false
            },
            periodClicked () {
                if (this.dialogLocked) {
                    return
                }
                this.addMode = true
            },
            emitDelete (event) {
                this.$emit('delete', event)
            }
        },
        components: {
            CalendarRecordAdder,
            Event,
            FirstEvent
        }
    }
</script>
<style scoped>
    .disabled {
        color: darkgray!important;
        cursor: not-allowed;
    }
    .context-menu {
        cursor: default;
    }
    .target {
        border: 3px solid #26A69A;
    }
    .single-mode-period {
        width: 100%;
        height: 100%;
        cursor: pointer;
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
</style>
