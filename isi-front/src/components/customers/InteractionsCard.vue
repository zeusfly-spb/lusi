<template>
    <span>
        <v-icon
            v-if="!noActivator"
            style="user-select: none; display: inline"
            class="clickable"
            title="Показать историю взаимодействия"
            :color="iconColor"
            @click="active=true"
        >
            contacts
        </v-icon>
        <v-dialog
            v-model="active"
            max-width="1000px"
            :persistent="$store.state.layout.customerEditing"
            @update:returnValue="close"
        >
            <v-card class="round-corner">
                <interactions-title
                    :lead="lead"
                    :customer="customer"
                    @close="close"
                />
                <v-card-text>
                    <lead-row
                        :lead="lead"
                    />
                    <events-row
                        :events="events"
                    />
                    <comments-row
                        :comments="comments"
                    />
                    <calls-row
                        :calls="calls"
                    />
                    <customer-row
                        :customer="customer"
                    />
                    <deals-row
                        :deals="deals"
                    />
                    <messages-row
                        :messages="messages"
                    />
                </v-card-text>
            </v-card>
        </v-dialog>
    </span>
</template>
<script>
    import EventsRow from './EventsRow'
    import CommentsRow from './CommentsRow'
    import LeadRow from './LeadRow'
    import CallsRow from './CallsRow'
    import CustomerRow from './CustomerRow'
    import DealsRow from './DealsRow'
    import InteractionsTitle from './InteractionsTitle'
    import MessagesRow from "./MessagesRow"

    const clone = arr => JSON.parse(JSON.stringify(arr))

    export default {
        name: 'InteractionsCard',
        props: {
            lead: Object,
            customer: Object,
            value: {
                type: Boolean,
                default: true
            },
            noActivator: {
                type: Boolean
            }
        },
        computed: {
            messages () {
                return this.customer && this.customer.sent_messages || []
            },
            iconColor () {
                return this.customer ? 'green' : 'yellow darken-3'
            },
            active: {
                get () {
                    return this.value
                },
                set (val) {
                    this.$emit('input', val)
                }
            },
            events () {
                return this.lead && this.lead.appointments || []
            },
            users () {
                return this.$store.state.users
            },
            comments () {
                return this.lead && this.lead.comments
                    && clone(this.lead.comments)
                        .reverse() || []
            },
            leads () {
                return this.lead ? [this.lead] : []
            },
            calls () {
                let base = this.lead && this.lead.calls || []
                base = base.map(item => ({
                    ...item,
                    user: this.users.find(user => +user.id === +item.user_id) || null
                }))
                return base.reverse()
            },
            deals () {
                let base = this.customer && this.customer.deals || []
                base = base.map(item => ({
                    ...item,
                    user: this.users.find(user => +user.id === +item.user_id) || null
                }))
                return  base.reverse() || []
            }
        },
        methods: {
            extendCustomer: async function () {
                let customer = await this.$store.dispatch('extendCustomer', this.customer.id)
                this.$emit('extendCustomer', customer)
            },
            close () {
                this.active = false
                this.$emit('close')
            }
        },
        mounted () {
            if (this.lead && this.customer) {
                this.$store.dispatch('pushFrame', {
                    type: 'request_get_customer_sent_messages',
                    model: {
                        lead_id: this.lead.id,
                        customer_id: this.customer.id
                    }
                })
            }
        },
        watch: {
            active (val) {
                if (val && this.customer) {
                    this.extendCustomer()
                }
            }
        },
        components: {
            EventsRow,
            CommentsRow,
            LeadRow,
            CallsRow,
            CustomerRow,
            DealsRow,
            InteractionsTitle,
            MessagesRow
        }
    }
</script>
<style>
.round-corner {
    border-radius: 5px;
}
.clickable {
    cursor: pointer;
    opacity: .8;
}
.clickable:hover {
    opacity: 1;
}
</style>
