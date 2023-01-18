<template>
    <div
        class="controls m-0 p-0"
    >
        <v-icon
            small
            color="blue"
            class="clickable"
            title="Редактировать шаблон"
            @click="$store.commit('SET_EDITED_NOTIFY_TEMPLATE', template)"
        >
            edit
        </v-icon>
        <v-icon
            small
            color="red"
            class="clickable"
            title="Удалить шаблон"
            @click="$store.commit('SET_DELETING_NOTIFY_TEMPLATE', template)"
        >
            delete
        </v-icon>
    </div>
</template>

<script>
    export default {
        name: 'NotifyTemplateControls',
        props: {
            template: Object
        }
    }
</script>

<style scoped>
    .controls {
        display: inline-flex;
    }
</style>
