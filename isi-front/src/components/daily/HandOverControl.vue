<template>
    <v-flex>
        <span class="green--text darken-4 font-weight-bold"
              v-if="!editing"
              @click="turnEditMode(true)"
        >
            {{ handover | pretty }}
        </span>
        <v-text-field
            v-else
            autofocus
            v-model="amount"
            single-line
            maxlength="7"
            style="width: 4em"
            height="1em"
            @blur="turnEditMode(false)"
            @keyup.esc="turnEditMode(false)"
            @keyup.enter="saveHandOver"
            data-vv-as="Сумма"
            data-vv-name="amount"
            :error-messages="errors.collect('amount')"
            v-validate="'integer'"
        />
    </v-flex>
</template>
<script>
    export default {
        name: 'HandOverControl',
        data: () => ({
            amount: null,
            editing: false
        }),
        computed: {
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            authUser () {
                return this.$store.state.authUser
            },
            isSuperAdmin () {
                return this.$store.getters.isSuperAdmin
            },
            handover () {
                return this.$store.state.handover
            }
        },
        methods: {
            saveHandOver () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('updateHandOver', this.amount)
                            .then(() => this.turnEditMode(false))
                    })

            },
            turnEditMode (mode) {
                if (mode) {
                    if (!this.workingIslandId) return
                    this.editing = true
                } else {
                    this.editing = false
                }
            }
        },
        created () {
            this.amount = this.handover
        }
    }
</script>
