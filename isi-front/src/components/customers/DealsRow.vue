<template>
    <div
        v-if="deals.length"
    >
        <strong>Сделки</strong>
        <v-data-table
            :items="[...deals, {id: null}]"
            hide-actions
            hide-headers
        >
            <template v-slot:items="props">
                <tr v-if="props.item.id">
                    <td align="left">
                        <v-avatar
                            size="36px"
                            :title="props.item.user && props.item.user.full_name || ''"
                            class="mr-1"
                        >
                            <img :src="basePath + props.item.user.avatar" alt="Фото" v-if="props.item.user && props.item.user.avatar">
                            <img :src="basePath + '/img/default.jpg'" alt="Без фото" v-if="props.item.user && !props.item.user.avatar">
                            <img :src="basePath + '/img/www.png'" alt="Без фото" v-if="!props.item.user">
                        </v-avatar>
                        {{ props.item.action && props.item.action.text || '' }}
                    </td>
                    <td
                        align="left"
                        v-if="props.item.is_service"
                    >
                        {{ props.item.service.description || ''}}
                    </td>
                    <td align="left"
                        v-else
                    >
                        {{ props.item.subscription_id ? subscriptionName(props.item.subscription_id) : props.item.insole.name }}
                    </td>
                    <td align="right">{{ props.item.income | pretty }} &#8381;</td>
                    <td align="right">{{ props.item.created_at | moment('DD MMMM YYYY г. HH:mm') }}</td>
                </tr>
                <tr v-else>
                    <td colspan="2"></td>
                    <td align="right"><strong>ИТОГО: {{ deals.reduce((a, b) => a + +b.income, 0) | pretty }} &#8381;</strong></td>
                    <td></td>
                </tr>
            </template>
        </v-data-table>

    </div>
</template>
<script>
    export default {
        name: 'DealsRow',
        props: ['deals'],
        computed: {
            subscriptions () {
                return this.$store.state.catalog.subscriptions
            },
            basePath () {
                return this.$store.state.basePath
            }
        },
        methods: {
            subscriptionName (id) {
                return this.subscriptions.find(item => +item.id === +id).name || null
            }
        }
    }
</script>
