<template>
    <div
        v-if="calls.length"
    >
        <strong>Исходящие звонки ({{ calls.length }})</strong>
        <v-data-table
            :items="calls"
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
                <td align="right">{{ props.item.timestamp | moment('DD MMMM YYYY г. HH:mm') }}</td>
            </template>
        </v-data-table>
    </div>
</template>
<script>
    export default {
        name: 'CallRow',
        props: ['calls'],
        computed: {
            basePath () {
                return this.$store.state.basePath
            }
        }
    }
</script>
