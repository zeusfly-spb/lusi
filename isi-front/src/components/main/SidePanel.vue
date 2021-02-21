<template>
    <v-navigation-drawer
        app
        fixed
        clipped
        :value="status"
    >
        <side-panel-events v-if="mode === 'events'"/>
        <side-options-panel v-if="mode === 'view-options'"/>
    </v-navigation-drawer>
</template>
<script>
    import  SidePanelEvents from '../appointments/SidePanelEvents'
    import SideOptionsPanel from "./SideOptionsPanel"
    export default {
        name: 'SidePanel',
        computed: {
            status () {
                return this.$store.state.layout.sidePanel
            },
            mode () {
                return this.$store.state.layout.sidePanelMode
            }
        },
        components: {
            SidePanelEvents,
            SideOptionsPanel
        }
    }
</script>
