<template>
    <div>
        <div v-for="(user, index) in users" :key="index">
            <v-avatar
                size="30px"
                :key="user.id"
                style="margin-bottom: .2em"
            >
                <img :src="`${basePath}${user.avatar ? user.avatar : '/img/default.jpg'}`"
                     alt="Фото"
                     :title="user.full_name"
                />
            </v-avatar>
            {{ user.full_name }}
        </div>
    </div>
</template>

<script>
    export default {
        name: 'GroupUsersColumn',
        props: ['users'],
        computed: {
            basePath () {
                return this.$store.state.basePath
            }
        }
    }
</script>
