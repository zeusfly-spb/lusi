<template>
    <div
        v-if="events.length"
    >
        <strong>Записи: ({{ events.length }})</strong>
        <v-data-table
            :items="events"
            hide-actions
            hide-headers
        >
            <template v-slot:items="props">
                <td align="left">
                    <v-avatar
                        size="36px"
                        :title="props.item.user && props.item.user.full_name || ''"
                    >
                        <img :src="basePath + props.item.user.avatar" alt="Фото" v-if="props.item.user && props.item.user.avatar">
                        <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-if="props.item.user && !props.item.user.avatar">
                        <img :src="basePath + '/img/www.png'" alt="Без фото" v-if="!props.item.user">
                    </v-avatar>
                </td>
                <td
                    align="left"
                >
                    Добавлена запись
                </td>
                <td
                    align="right"
                >
                    {{ props.item.date | moment('D MMMM YYYY г. HH:mm') }}
                </td>
            </template>
        </v-data-table>
    </div>
</template>
<script>
    export default {
        name: 'EventsRow',
        props: ['events'],
        computed: {
            basePath () {
                return this.$store.state.basePath
            }
        }
    }
</script>
