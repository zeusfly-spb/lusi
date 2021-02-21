<template>
    <v-card-title
        class="light-blue darken-3"
    >
        <v-icon
            :color="customer ? 'green' : 'yellow darken-3'"
            class="pr-2"
        >
            contacts
        </v-icon>
        <span class="title white--text">
            История взаимодействия
            <span v-if="lead && !customer">по заявке с номера {{ lead.phone  | phone}}</span>
            <span v-else>с клиентом {{ customer && customer.full_name || '' }}</span>
        </span>
        <v-spacer/>
        <v-icon
            color="white"
            class="clickable"
            title="Закрыть"
            @click="$emit('close')"
        >
            close
        </v-icon>
    </v-card-title>

</template>
<script>
    export default {
        name: 'InteractionsTitle',
        props: ['customer', 'lead']
    }
</script>
