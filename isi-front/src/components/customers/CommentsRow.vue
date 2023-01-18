<template>
    <div
        v-if="comments.length"
    >
        <strong>Комментарии ({{ comments.length }})</strong>
        <v-data-table
            :items="comments"
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
                <td align="left">{{ props.item.text }}</td>
                <td align="right">{{ props.item.created_at | moment('DD MMMM YYYY г. HH:mm') }}</td>
            </template>
        </v-data-table>
    </div>
</template>
<script>
    export default {
        name: 'CommentsRow',
        props: ['comments'],
        computed: {
            basePath () {
                return this.$store.state.basePath
            }
        }
    }
</script>
