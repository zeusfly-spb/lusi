<template>
    <v-flex xs12 sm12 md12>
        <v-card
                class="round-corner"
        >
            <v-card-title class="light-blue darken-3"
                          style="height: 2em; margin: 0; padding: 0"
            >
                    <span class="subheading white--text"
                          style="margin: 0 1em"
                    >
                        Оповещения
                    </span>
            </v-card-title>
            <v-card-text>
                <notify-templates/>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    import NotifyTemplates from './NotifyTemplates'
    export default {
        name: 'NotificationsControl',
        components: {
            NotifyTemplates
        }
    }
</script>

<style scoped>

</style>
