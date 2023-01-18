<template>
    <div v-if="messages.length">
        <strong>Исходящие сообщения</strong>
        <v-data-table
            :items="preparedMessages"
            hide-actions
            hide-headers
        >
            <template v-slot:items="props">
                <td
                    align="left"
                >
                    <user-avatar
                        v-if="props.item.user"
                        :user="props.item.user"
                    />
                    <v-avatar
                        v-else
                        size="36px"
                        title="Системное сообщение"
                    >
                        <img
                            :src="`${basePath}/img/logo.png`"
                        />
                    </v-avatar>
                </td>
                <td>
                    {{ props.item.text }}
                </td>
                <td
                    align="right"
                >
                    {{ props.item.created_at | moment('D MMMM YYYY г. H:mm') }}
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script>
    import UserAvatar from '../main/UserAvatar'
    export default {
        name: 'MessagesRow',
        props: {
            messages: Array
        },
        computed: {
            basePath () {
                return this.$store.state.basePath
            },
            users () {
                return this.$store.state.users
            },
            preparedMessages () {
                const attachUser = message => {
                    let user = !message.user_id ? null
                        : +message.user_id === 1 ? {full_name: 'Суперадмин'}
                            : this.users.find(user => +user.id === +message.user_id)
                    return {... message, user: user}
                }
                let base = this.messages.reverse()
                base = base.map(item => attachUser(item))
                return base
            }
        },
        components: {
            UserAvatar
        }
    }
</script>

<style scoped>

</style>
