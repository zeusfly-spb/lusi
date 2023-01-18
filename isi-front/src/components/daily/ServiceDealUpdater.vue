<template>
    <v-flex>
        <span
            v-if="!active"
            class="clickable"
            @click="workingIsland ? activate() : null"
        >
            {{ description }}
        </span>
        <v-select
            autofocus
            v-if="active"
            v-model="selectedServiceId"
            item-text="description"
            item-value="id"
            :items="islandServices"
            @keyup.esc="deactivate"
            @focus="activate"
            @blur="deactivate"
        />
    </v-flex>

</template>

<script>
    export default {
        name: 'ServiceDealUpdater',
        props: {
            deal: {
                type: Object,
                required: true
            }
        },
        data: () => ({
            active: false
        }),
        computed: {
            workingIsland () {
                return this.$store.getters.workingIsland || null
            },
            selectedServiceId: {
                get () {
                    return this.deal.service_id
                },
                set (val) {
                    this.$store.dispatch('updateDealServiceId', {
                        deal_id: this.deal.id,
                        service_id: val
                    })
                        .then(() => this.deactivate())
                }
            },
            islandServices () {
                const value = () => this.$store.getters.workingIsland.services
                let island = this.$store.getters.workingIsland || null
                return island && island.services && island.services.length && value() || []
            },
            description () {
                return this.deal.service.description
            }
        },
        methods: {
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            }
        }
    }
</script>

<style scoped>

</style>
