<template>
    <div
        v-if="lead"
    >
        <strong>Заявка</strong>
        <v-data-table
            :items="[lead]"
            hide-actions
            hide-headers
        >
            <template v-slot:items="props">
                <td align="left">{{ props.item.name }}</td>
                <td align="left">{{ props.item.phone | phone }}</td>
                <td align="right">{{ props.item.date | moment('D MMMM YYYY г. HH:mm') }}</td>
            </template>
        </v-data-table>
    </div>
</template>
<script>
    export default {
        name: 'LeadRow',
        props: ['lead']
    }
</script>
