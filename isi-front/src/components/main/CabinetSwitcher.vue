<template>
    <div
        class="cabinet-switcher flex-center"
    >
        <v-radio-group
            row
            v-model="activeCabinetId"
        >
            <v-radio
                v-for="(cabinet, index) in cabinets"
                :key="index"
                :label="cabinet.name"
                :value="cabinet.id"
            />
        </v-radio-group>
    </div>
</template>

<script>
    export default {
        name: 'CabinetSwitcher',
        data: () => ({
            val: null
        }),
        computed: {
            activeCabinetId: {
                get () {
                    return this.$store.state.appointment.activeCabinetId
                },
                set (val) {
                    this.$store.commit('SET_ACTIVE_CABINET_ID', val)
                }
            },
            cabinetIds () {
                return this.cabinets && this.cabinets.map(cabinet => cabinet.id)
            },
            cabinets () {
                if (this.$store.getters.callCenter) {
                    return this.$store.getters.inspectingIsland && this.$store.getters.inspectingIsland.cabinets
                }
                return this.workingIsland && this.workingIsland.cabinets
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
        },
        methods: {
            switchTo (cabinet) {
                this.$store.commit('SET_ACTIVE_CABINET_ID', cabinet.id)
            }
        }
    }
</script>

<style scoped>
    .cabinet-switcher {
        width: 100%;
        height: 100%;
    }
    .active-cabinet {
        font-weight: bold;
        color: #03a9f4;
    }
    .flex-center {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>
