<template>
    <v-tabs
        fixed-tabs
        centered
        slider-color="green"
        height="70"
        hide-slider
    >
        <v-tab
            v-for="(tab, index) in inspectableIslands"
            :key="index"
        >
            <v-card
                :class="{'blue lighten-3': tab.id === inspectingIslandId}"
            >
                <v-card-text>
                    {{ tab.name }}
                </v-card-text>
            </v-card>
        </v-tab>
    </v-tabs>
</template>

<script>
    export default {
        name: 'InspectingIslandSwitcher',
        computed: {
            inspectingIslandId () {
                return this.$store.state.callcenter.inspectingIslandId
            },
            inspectableIslands () {
                return this.$store.getters.allIslands.filter(item => !item.is_call_center)
            }
        },
        methods: {
            setInspectingIsland (island) {
                this.$store.dispatch('setInspectingIslandId', island.id)
                    .then(() => this.$store.dispatch('setAppointments'))
            },
            setDefaults () {
                if (this.inspectableIslands.length) {
                    this.$store.dispatch('setInspectingIsland', this.inspectableIslands[0])
                }
            }
        },
        created () {
            this.setDefaults()
        },
        watch: {
            inspectableIslands () {
                this.setDefaults()
            }
        }
    }
</script>

<style scoped>

</style>
