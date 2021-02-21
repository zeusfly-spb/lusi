<template>
    <v-sheet
        height="100%"
        color="blue lighten-5"
    >
        <v-flex
            class="subheading pt-1 text-xs-center"
        >
            <strong>Настройки отображения</strong>
        </v-flex>
        <v-switch
            v-model="miniMode"
            label='Режим "Мини"'
            :true-value="true"
            :false-value="false"
        />
        <v-switch
            v-model="hideReminders"
            label='Скрыть напоминания'
            :true-value="true"
            :false-value="false"
        />

    </v-sheet>
</template>
<script>
    export default {
        name: 'SideOptionsPanel',
        computed: {
            hideReminders: {
                get () {
                    return this.$store.getters.hideReminders
                },
                set (val) {
                    let backup = this.$store.getters.showTodayPostpones
                    if (!val) {
                        this.$store.commit('SET_TODAY_POSTPONES', true)
                        this.$store.dispatch('setLeadsOnTimer')
                            .finally(() => this.$store.commit('SET_TODAY_POSTPONES', backup))
                    }
                    return this.$store.commit('SET_HIDE_REMINDERS_VALUE', val)
                }
            },
            miniMode: {
                get () {
                    return this.$store.getters.miniMode
                },
                set (val) {
                    this.$store.commit('SET_MINI_MODE_VALUE', val)
                }
            }
        }
    }
</script>
