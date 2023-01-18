<template>
    <v-flex>
        <v-text-field
            autofocus
            v-if="active"
            v-model="lead.comment"
            @blur="deactivate"
            @keyup.esc="deactivate"
            @keyup.enter="update"
        />
        <span
            v-else
            class="clickable"
            :title="`Изменить комментарий для заявки с номера ${lead.phone}`"
            @click="activate"
        >
            {{ lead.comment || '-------------' }}
        </span>
    </v-flex>
</template>
<script>
    export default {
        name: 'LeadCommentUpdater',
        props: ['lead'],
        data: () => ({
            active: false
        }),
        methods: {
            update () {
                this.$store.dispatch('updateLeadComment', {
                    lead_id: this.lead.id,
                    comment: this.lead.comment
                })
                    .then(() => {
                        this.deactivate()
                        this.$emit('updated', `Комментарий к заявке с номера ${this.lead.phone} обновлен`, 'green')
                    })
            },
            activate () {
                this.$store.commit('SET_SCAN_MODE', {... this.$store.state.scanMode, leads: false})
                this.active = true
            },
            deactivate () {
                this.$store.commit('SET_SCAN_MODE', {... this.$store.state.scanMode, leads: true})
                this.active = false
            }
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
    }
    .clickable:hover {
        font-weight: bold;
    }
</style>
