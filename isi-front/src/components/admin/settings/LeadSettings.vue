<template>
    <v-card
        class="round-corner"
        style="height: 400px"
    >
        <v-card-title class="light-blue darken-3"
                      style="height: 2em; margin: 0; padding: 0"
        >
            <span class="subheading white--text"
                  style="margin: 0 1em"
            >
                Настройки источников заявок
            </span>
        </v-card-title>
        <v-card-text>
            <v-switch
                v-model="filterLeads"
                label="Фильтровать входящие заявки"
            />
        </v-card-text>

    </v-card>
</template>

<script>
    export default {
        name: 'LeadSettings',
        computed: {
            base () {
                return this.$store.state.settings.data
            },
            filterLeads: {
                get () {
                    return this.base.filterLeads || false
                },
                set (val) {
                    this.$store.dispatch('updateSetting', {data: {...this.base, filterLeads: val}})
                        .then(() => {
                            let text = `${val ? 'Включена ' : 'Выключена '} служба фильтрации входящих заявок`
                            this.$store.dispatch('pushMessage', {text})
                        })
                }
            }
        }
    }
</script>

<style scoped>

</style>
