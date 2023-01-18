<template>
    <v-icon
        :title="`${active ? 'Закрыть' : 'Открыть'} панель настроек отображения`"
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
        settings
    </v-icon>
</template>

<script>
    export default {
        name: 'SettingsButton',
        computed: {
            active () {
                return this.sidePanelStatus && this.sidePanelMode === 'view-options'
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
                    mode: this.active ? null : 'view-options'
                })
            }
        }
    }
</script>

