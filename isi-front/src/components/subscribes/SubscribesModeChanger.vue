<template>
    <v-flex>
        <v-btn
                flat
                v-for="mode in modes"
                :key="mode.value"
                @click="setSubscribeMode(mode.value)"
        >
            <span class="ml-1 mr-1"
                  :class="{
                            'disabled': subscribeViewMode !== mode.value,
                            'current': subscribeViewMode === mode.value
                        }"
            >
                {{ mode.title }}
            </span>
        </v-btn>
    </v-flex>
</template>

<script>
    export default {
        name: 'SubscribesModeChanger',
        data: () => ({
            modes: [
                {title: 'Активные', value: null},
                {title: 'Неактивные', value: 'inactive'},
                {title: 'Все', value: 'all'},
            ]
        }),
        computed: {
            subscribeViewMode () {
                return this.$store.state.subscribes.subscribeViewMode
            }
        },
        methods: {
            setSubscribeMode (mode) {
                this.subscribeViewMode !== mode ? this.$store.commit('SET_SUBSCRIBE_MODE', mode) : null
            }
        }
    }
</script>

<style scoped>
    .current {
        color: #03A9F4;
        font-weight: bold;
    }
    .disabled {
        color: #757575;
    }
</style>
