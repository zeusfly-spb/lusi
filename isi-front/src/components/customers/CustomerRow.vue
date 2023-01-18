<template>
    <div
        v-if="customer"
    >
        <strong>Клиент</strong>
        <v-data-table
            :items="[customer]"
            hide-headers
            hide-actions
        >
            <template v-slot:items="props">
                <td align="left">
                    <span class="title green--text ">{{ props.item.full_name }}</span>
                    <v-btn icon
                           v-if="!edit"
                           @click="edit = true"
                           title="Редактировать данные клиента"
                    >
                        <v-icon
                            color="green"
                        >
                            edit
                        </v-icon>
                    </v-btn>
                </td>
                <td align="left">{{ props.item.birth_date | moment('D MMMM YYYY г.')}}</td>
                <td align="right">{{ props.item.address }}</td>
            </template>
        </v-data-table>
        <customer-editor
            v-model="edit"
            :customer="customer"
        />
    </div>
</template>
<script>
    import CustomerEditor from './CustomerEditor'
    export default {
        name: 'CustomerRow',
        props: ['customer'],
        computed: {
            edit: {
                get () {
                    return this.$store.state.layout.customerEditing
                },
                set (val) {
                    this.$store.commit('SET_CUSTOMER_EDITING', val)
                }
            }
        },
        components: {
            CustomerEditor
        }
    }
</script>
