<template>
    <v-menu
            v-if="!$store.state.appointment.draggedEvent"
            v-model="visible"
            :close-on-content-click="false"
            transition="scale-transition"
            :activator="getSelectorElement(selector)"
            :nudge-right="40"
            :nudge-bottom="-10"
            lazy
            offset-y
            full-width
            min-width="290px"
    >
        <event-context-menu-entry
            :event="event"
            @changed="visible = false"
        />
    </v-menu>
</template>
<script>
    import EventContextMenuEntry from './EventContextMenuEntry'
    export default {
        name: 'EventContextMenu',
        props: ['value', 'event', 'selector'],
        data: () => ({
            contextMenuRaw: [
                {title: 'Сменить статус на "Выполнено"', action: 'done'},
                {title: 'Сменить статус на "Отменено"', action: 'cancel'},
                {title: 'Сменить статус на "Активно"', action: 'active'},
            ],
            commonItems: [
                {title: 'Редактировать', action: 'edit', icon: 'edit', color: 'blue'},
                {title: 'Удалить', action: 'delete', icon: 'delete', color: 'red'}
            ]
        }),
        computed: {
            contextMenuItems () {
                let toExcept = {active: 'active', cancelled: 'cancel', completed: 'done'}[this.event.status]
                return this.contextMenuRaw.filter(item => item.action !== toExcept)
            },
            visible: {
                get () {
                    return this.value
                },
                set (val) {
                    this.$emit('input', val)
                }
            }
        },
        methods: {
            getSelectorElement (sel) {
                return document.getElementById(sel)
            },
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
                this.visible = false
            },
            dialogLockControl (val) {
                val ? this.$store.commit('LOCK_DIALOG') : this.$store.commit('UNLOCK_DIALOG')
            },
            performAction (action) {
                this.$store.dispatch('changeEventStatus', {
                    event_id: this.event.id,
                    status: `${{done: 'completed', cancel: 'cancelled', active: 'active'}[action]}`
                })
                    .then(() => {
                        this.visible = false
                        let text = `Статус записи изменен на ${{done: 'Выполнено', cancel: 'Отменено', active: 'Активно'}[action]}`
                        this.$store.commit('SEND_EVENT_MESSAGE', {color: 'green', text: text})
                    })
            },
            can (action) {
                switch (action) {
                    case 'done':
                        return this.event.status !== 'completed' || false
                    case 'cancel':
                        return this.event.status !== 'cancelled' || false
                    case 'active':
                        return this.event.status !== 'active' || false
                }
            }
        },
        components: {
            EventContextMenuEntry
        }
    }
</script>
<style scoped>
    .main-list-tile {
        margin: 0!important;
        padding: 0!important;
    }
    .list-style {
        margin: 0!important;
        padding: 0!important;
    }
    .context-menu {
        cursor: default;
    }
</style>
