<template>
    <v-container
        grid-list-md
    >
        <v-layout wrap>
            <services-catalog/>
            <subscriptions-catalog/>
            <notifications-control/>
            <sites-catalog/>
            <table-constructor/>
        </v-layout>
    </v-container>
</template>
<script>
    import ServicesCatalog from './catalogs/ServicesCatalog'
    import SubscriptionsCatalog from './catalogs/SubscriptionsCatalog'
    import NotificationsControl from './catalogs/NotificationsControl'
    import SitesCatalog from './catalogs/SitesCatalog'
    import TableConstructor from './catalogs/TableConstructor'
    export default {
        name: 'CatalogControl',
        components: {
            ServicesCatalog,
            SubscriptionsCatalog,
            NotificationsControl,
            SitesCatalog,
            TableConstructor
        }
    }
</script>
