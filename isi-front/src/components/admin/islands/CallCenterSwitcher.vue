<template>
    <v-layout
        class="text-center body-2"
    >
        <v-switch
            v-model="callCenter"
            label="Использовать как кол-центр"
        />
    </v-layout>
</template>

<script>
    export default {
        name: 'CallCenterSwitcher',
        props: {
            island_id: Number
        },
        data: () => ({
            island: null
        }),
        computed: {
            callCenter: {
                get () {
                    const value = () => this.island.options.callCenter || false
                    return this.island && this.island.options ? value() : false
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island_id,
                        key: 'callCenter',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            }
        },
        methods: {
            setIsland () {
                this.island = this.$store.state.islands.find(item => +item.id === +this.island_id)
            }
        },
        created () {
            this.setIsland()
        }
    }
</script>

<style scoped>

</style>
