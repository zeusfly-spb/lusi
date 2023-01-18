<template>
    <v-flex>
        <panel-events-single/>
    </v-flex>
</template>
<script>
    import PanelEventsCabinets from './PanelEventsCabinets'
    import PanelEventsSingle from './PanelEventsSingle'
    export default {
        name: 'SidePanelEvents',
        computed: {
            hasCabinets () {
                let island = this.$store.getters.workingIsland
                return  island && island.cabinets && island.cabinets.length
            }
        },
        components: {
            PanelEventsSingle,
            PanelEventsCabinets
        }
    }
</script>

