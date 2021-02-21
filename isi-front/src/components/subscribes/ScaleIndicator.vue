<template>
    <div
        class="scale"
        :class="{'clickable': eventsOpenId !== subscribe.id}"
        :title="title"
        @click="fire"
    >
        <v-sheet
            width="1.2em"
            height="1.2em"
            v-for="(item, index) in scale"
            :key="index"
            :elevation="eventsOpenId === subscribe.id ? 0 : item ? 3 : 0"
        >
            <v-icon
                small
                :color="$store.getters.eventStatusColor(item)"
            >
                {{ $store.getters.eventStatusIcon(item) }}
            </v-icon>
        </v-sheet>
    </div>
</template>

<script>
    export default {
        name: 'ScaleIndicator',
        props: {
            subscribe: Object
        },
        computed: {
            eventsOpenId () {
                return this.$store.state.subscribes.eventsOpenId
            },
            title () {
                let all = this.subscribe.nominal
                let appointed = this.subscribe.events.length || 0
                let completed = this.subscribe.events.filter(event => event.status === 'completed').length || 0
                return `Записей всего: ${all}, назначено: ${appointed}, выполнено: ${completed}`
            },
            scale () {
                return this.subscribe.scale
            }
        },
        methods: {
            fire () {
                this.$emit('fire')
            }
        }
    }
</script>

<style scoped>
    .scale {
        cursor: pointer;
        display: flex;
        flex-direction: row;
    }
</style>
