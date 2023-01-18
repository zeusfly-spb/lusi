<template>
    <v-flex
        style="width: 100%; display: flex;"
        ref="mainTr"
    >
        <div
            v-if="tabMode"
            class="text-md-center"
            style="width: 100%"
        >
            <span
                class="tab-mode-header title"
            >
                <strong>{{ activeCabinetName }}</strong>
            </span>
        </div>
        <div
            v-else
            v-for="(cabinet, index) in cabinets"
            :style="{'width': `${cabinetWidth(cabinet)}px`}"
            class="cabinets-header"
            :key="index"
        >
            <strong>{{ cabinet.name }}</strong>
        </div>
    </v-flex>
</template>
<script>
    export default {
        name: 'CabinetsModeHeader',
        props: ['cabinets'],
        data: () => ({
            fullWidth: null
        }),
        computed: {
            activeCabinetName () {
                return this.cabinets.find(item => item.id === this.$store.state.appointment.activeCabinetId).name || ''
            },
            workingIsland () {
                return this.$store.getters.workingIsland
            },
            tabMode () {
                return this.$store.state.appointment.tabMode
            },
            columnWidth () {
                return this.fullWidth && this.fullWidth / this.cabinets.length || null
            },
            names () {
                return this.cabinets.map(item => item.name)
            }
        },
        methods: {
            cabinetWidth (cabinet) {
                return cabinet.id === this.$store.state.appointment.openCabinetId ? this.$store.state.appointment.openCabinetWidth : this.columnWidth
            }
        },
        mounted () {
            this.fullWidth = this.$refs.mainTr.offsetWidth
            this.$emit('computed', this.columnWidth)
        },
        updated () {
            this.fullWidth = this.$refs.mainTr.offsetWidth
            this.$emit('computed', this.columnWidth)
        }
    }
</script>
<style>
    .tab-mode-header {
        color: #03a9f4;
    }
    .cabinets-header {
        text-align: center;
        padding: 0!important;
        margin: 0!important;
        height: 1.5em!important;
        border: 1px solid grey;
        overflow: hidden;
    }
</style>
