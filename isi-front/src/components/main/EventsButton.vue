<template>
    <v-icon
        :title="`${active ? 'Закрыть' : 'Открыть'} панель записей`"
        style="user-select: none"
        class="clickable mr-2"
        :class="{
                    'blue--text text--lighten-3': active,
                    'grey--text text--lighten-1': !active
                }"
        :small="isMobile"
        :large="!isMobile"
        @click="toggleActivity"
    >
        event
    </v-icon>
</template>
<script>
    export default {
        name: 'EventsButton',
        computed: {
            active () {
                return this.sidePanelStatus && this.sidePanelMode === 'events'
            },
            sidePanelStatus () {
                return this.$store.state.layout.sidePanel
            },
            sidePanelMode () {
                return this.$store.state.layout.sidePanelMode
            },
            isMobile () {
                return ['xs', 'sm'].includes(this.$vuetify.breakpoint.name)
            }
        },
        methods: {
            toggleActivity () {
                this.$store.commit('SET_SIDE_PANEL_STATUS', {
                    status: !this.active,
                    mode: this.active ? null : 'events'
                })
            }
        }
    }
</script>
