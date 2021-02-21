<template>
    <tr>
        <td>
            {{ index + 1 }}
        </td>
        <td>
            {{ subscribe.customer.full_name }}
        </td>
        <td>
            <user-avatar
                :user="subscribe.user"
            />
            <span>
                {{ subscribe.user.is_superadmin ? 'Суперадмин' : subscribe.user.full_name }}
            </span>
        </td>
        <td>
            {{ subscribe.subscription.name }}
        </td>
        <td>
            {{ subscribe.start_date |  moment('D MMMM YYYY г.') }}
        </td>
        <td>
            {{ subscribe.finish_date |  moment('D MMMM YYYY г.') }}
        </td>
        <td>
            <scale-indicator
                :subscribe="subscribe"
                @fire="openEvents"
            />
        </td>
        <td>
            <span
                v-if="subscribe.last_comment"
                class="last-comment clickable"
                title="Открыть панель комментариев"
                @click="openComments"
            >
                {{ subscribe.last_comment.text || ''}}
                <span
                    v-if="commentsCount > 1"
                    class="green--text"
                >
                    <strong>({{ commentsCount }})</strong>
                </span>
            </span>
            <v-icon
                v-else
                color="green"
                class="clickable"
                title="Добавить комментарий"
                @click="openComments"
            >
                add_circle_outline
            </v-icon>
        </td>
    </tr>
</template>

<script>
    import UserAvatar from '../main/UserAvatar'
    import ScaleIndicator from './ScaleIndicator'
    export default {
        name: 'Subscribe',
        props: ['index', 'subscribe'],
        computed: {
            commentsCount () {
                let comments = this.subscribe && this.subscribe.comments ? Object.values(this.subscribe.comments) : []
                return comments.length
            },
            commentsOpenId () {
                return this.$store.state.subscribes.commentsOpenId
            },
            eventsOpenId () {
                return this.$store.state.subscribes.eventsOpenId
            },
            events () {
                return this.subscribe && this.subscribe.events || []
            }
        },
        methods: {
            openEvents () {
                this.$store.commit('SET_SUBSCRIBE_EVENTS_OPEN_ID', this.subscribe.id)
            },
            openComments () {
                this.$store.commit('SET_SUBSCRIBE_COMMENTS_OPEN_ID', this.subscribe.id)
            }
        },
        components: {
            UserAvatar,
            ScaleIndicator
        }
    }
</script>

<style scoped>
    .last-comment:hover {
        color: #03A9F4;
    }

</style>
