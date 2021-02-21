<template>
    <tr>
        <td>
            {{ index + 1 }}
        </td>
        <td>
            {{ certificate.customer.full_name || '' }}
        </td>
        <td>
            <user-avatar
                    :user="certificate.user"
            />
        </td>
        <td>
            {{ certificate.nominal }}
        </td>
        <td>
            {{ certificate.start_date | moment('D MMMM YYYY г.') }}
        </td>
        <td
                align="center"
        >
            {{ certificate.duration }}
        </td>
        <td>
            {{ certificate.finish_date | moment('D MMMM YYYY г.') }}
        </td>
        <td>
            {{ certificate.writeoffs }}
        </td>
        <td>
            <span
                    v-if="certificate.last_comment"
                    class="last-comment clickable"
                    title="Открыть панель комментариев"
                    @click="openCertComments(certificate.id)"
            >
                    {{ certificate.last_comment.text || ''}}
                <span
                      v-if="certificate.comments.length > 1"
                      class="green--text"
                >
                    <strong>({{ certificate.comments.length }})</strong>
                </span>
            </span>
            <v-icon
                    v-else
                    color="green"
                    class="clickable"
                    title="Добавить комментарий"
                    @click="openCertComments(certificate.id)"
            >
                add_circle_outline
            </v-icon>
        </td>
    </tr>
</template>

<script>
    import UserAvatar from '../main/UserAvatar'

    export default {
        name: 'Certificate',
        props: ['index', 'certificate'],
        methods: {
            openCertComments (id) {
                this.$store.commit('SET_CERT_COMMENTS_OPEN_ID', id)
            }
        },
        components: {
            UserAvatar
        }
    }
</script>

<style scoped>
    .last-comment:hover {
        color: #03A9F4;
    }
</style>
