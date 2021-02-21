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
                        Абонементы
                    </span>
            </v-card-title>
            <v-card-text>
                <v-flex>
                    <subscription-commander/>
                    <subscriptions-table/>
                    <subscription-remover/>
                </v-flex>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    import SubscriptionCommander from './SubscriptionCommander'
    import SubscriptionsTable from './SubscriptionsTable'
    import SubscriptionRemover from './SubscriptionRemover'
    export default {
        name: 'SubscriptionsCatalog',
        components: {
            SubscriptionsTable,
            SubscriptionCommander,
            SubscriptionRemover
        }
    }
</script>
