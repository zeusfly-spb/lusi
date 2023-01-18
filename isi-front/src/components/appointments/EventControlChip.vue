<template>
    <v-chip
        disabled
        :outline="outline"
        class="pl-1 pr-1"
        :color="flat ? 'white' : ''"
    >
        <v-speed-dial
            v-model="fab"
            open-on-hover
            transition="slide-y-reverse-transition"
        >
            <template v-slot:activator>
                <v-icon
                    style="margin-top: 3px"
                    size="20"
                    class="clickable"
                    title="Сменить статус записи"
                    ref="activator"
                    :color="fabStyle.color"
                >
                    {{ fabStyle.icon }}
                </v-icon>
            </template>
            <v-layout
                column
                :style="{'top': layoutTop, 'position': event.first ? 'fixed' : 'absolute'}"
            >
                <v-btn
                    v-for="(item, index) in statsButtons"
                    icon
                    dark
                    style="margin: .15em!important; padding: 0!important;"
                    :style="{'width': event.first ? 20 : 15}"
                    :key="index"
                    :color="item.color"
                    :title="item.title"
                    @click="performAction(item.status)"
                >
                    <v-icon
                        small
                    >
                        {{ item.icon }}
                    </v-icon>
                </v-btn>
            </v-layout>
        </v-speed-dial>
        <v-icon
            size="20"
            color="green"
            class="clickable"
            title="Редактировать запись"
            @click="$store.commit('SET_EDITED_EVENT', event)"
        >
            edit
        </v-icon>
        <v-icon
            size="20"
            color="red"
            class="clickable"
            title="Удалить запись"
            v-if="isSuperadmin"
            @click="$store.commit('ATTEMPT_TO_DELETE_EVENT', event)"
        >
            delete
        </v-icon>
    </v-chip>
</template>
<script>
    export default {
        name: 'EventControlChip',
        props: {
            event: Object,
            hover: Boolean,
            outline: Boolean,
            flat: Boolean
        },
        data: () => ({
            fabRect: null,
            fab: false,
            statsRaw: [
                {status: 'active', color: 'blue', icon: 'event', title: 'Сменить статус на "Активно"'},
                {status: 'completed', color: 'green', icon: 'event_available', title: 'Сменить статус на "Выполнено"'},
                {status: 'cancelled', color: 'red', icon: 'event_busy', title: 'Сменить статус на "Отказ"'},
                {status: 'moderate', color: 'amber darken-3', icon: 'assignment_late', title: 'Сменить статус на "Модерация"'},
                {status: 'postponed', color: 'orange accent-4', icon: 'timelapse', title: 'Сменить статус на "Отложена"'}
            ],
            layoutTop: null
        }),
        computed: {
            statsButtons () {
                let base = this.statsRaw
                if (!this.isSuperadmin) {
                    base = base.filter(item => item.status !== 'cancelled')
                }
                switch (this.event.status) {
                    case 'moderate':
                        base = base.filter(item => ['active', 'cancelled'].includes(item.status))
                        break
                    case 'active':
                        base = base.filter(item => ['moderate', 'postponed'].includes(item.status))
                        break
                    case 'postponed':
                        base = base.filter(item => ['active', 'moderate'].includes(item.status))
                        break
                    case 'completed':
                        base = base.filter(item => ['moderate', 'cancelled'].includes(item.status))
                        break
                    case 'cancelled':
                        base = base.filter(item => ['active', 'postponed'].includes(item.status))
                        break
                }

                return base.filter(item => item.status !== this.event.status)
            },
            fabStyle () {
                const colors = {
                    active: 'blue',
                    postponed: 'orange',
                    moderate: 'amber',
                    cancelled: 'red',
                    completed: 'green'
                }
                const icons = {
                    active: 'event',
                    postponed: 'timelapse',
                    moderate: 'assignment_late',
                    cancelled: 'event_busy',
                    completed: 'event_available'
                }
                return {
                    color: colors[this.event.status],
                    icon: icons[this.event.status]
                }
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            }
        },
        mounted () {
            let padding = 45 * this.statsButtons.length
            if (this.event.first) {
                this.layoutTop = this.$refs.activator.$el.getBoundingClientRect().top + document.body.scrollTop - padding + 'px'
            } else {
                this.layoutTop = window.pageYOffset - padding + 5 + 'px'
            }
        },
        methods: {
            performAction (status) {
                const desc = {
                    completed: 'Завершена',
                    active: 'Активна',
                    postponed: 'Отложена',
                    cancelled: 'Отменена',
                    moderate: 'На модерации'
                }
                this.$store.dispatch('changeEventStatus', {
                    event_id: this.event.id,
                    status: status
                })
                    .then(() => {
                        this.visible = false
                        let text = `Статус записи изменен на ${desc[status]}`
                        this.$store.dispatch('pushMessage', {color: 'green', text: text})
                    })
            }
        }
    }
</script>


