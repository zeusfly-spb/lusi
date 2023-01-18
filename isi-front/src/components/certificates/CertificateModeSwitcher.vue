<template>
    <v-flex>
        <v-btn
                flat
                v-for="mode in modes"
                :key="mode.value"
                @click="setCertificateMode(mode.value)"
        >
            <span class="ml-1 mr-1"
                  :class="{
                            'disabled': certificateViewMode !== mode.value,
                            'current': certificateViewMode === mode.value
                        }"
            >
                {{ mode.title }}
            </span>
        </v-btn>

    </v-flex>
</template>

<script>
    export default {
        name: 'CertificateModeSwitcher',
        data: () => ({
            modes: [
                {title: 'Активные', value: 'active'},
                {title: 'Неактивные', value: 'inactive'},
                {title: 'Все', value: 'all'}
            ]
        }),
        computed: {
            certificateViewMode () {
                return this.$store.state.subscribes.certificatesMode
            }
        },
        methods: {
            setCertificateMode (mode) {
                this.$store.dispatch('setCertificateMode', mode)
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

