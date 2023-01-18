<template>
    <div
        class="mt-2"
    >
        <v-btn
            flat
            small
            v-for="(mode, index) in modes"
            :key="index"
            :depressed="mode.name === viewMode"
            :title="mode.name !== viewMode ? `Переключить визуализацию на режим ${mode.description}` : ''"
            @click="setMode(mode.name)"
        >
            <span
                class="m-2"
                :class="{
                            'disabled': viewMode !== mode.name,
                            'current': viewMode === mode.name
                        }"
            >
                {{ mode.description }}
            </span>
        </v-btn>
    </div>
</template>

<script>
    export default {
        name: 'CalendarViewSwitcher',
        props: ['value'],
        data: () => ({
            modes: [
                {name: 'notifications', description: 'Оповещения'},
                {name: 'subscriptions', description: 'Абонементы'},
                {name: 'certificates', description: 'Сертификаты'},
                {name: 'archive', description: 'Архив'},
                {name: 'calendar', description: 'Календарь'},
            ]
        }),
        computed: {
            viewMode: {
                get () {
                    return this.value
                },
                set (val) {
                    this.$emit('input', val)
                }
            }
        },
        methods: {
            setMode (mode) {
                this.viewMode = mode
            }
        },
        mounted () {
            this.viewMode = 'calendar'
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
