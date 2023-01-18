<template>
    <v-flex>
        <strong
            v-if="!active"
            @click="active = true"
            class="changeable"
            :title="`Изменить ${targetCaption} для сотрудника ${user.full_name}`"
        >
            {{ +user[targetFieldName] | pretty }}
        </strong>
        <v-text-field
            type="number"
            v-else
            v-model="targetField"
            style="width: 3em"
            height="1em"
            align="right"
            autofocus
            right
            single-line
            @blur="cancel"
            @keyup.esc="cancel"
            @keyup.enter="saveRate"
        />
    </v-flex>
</template>
<script>
    export default {
        name: 'RateUpdater',
        props: ['user', 'mode', 'caption'],
        data: () => ({
            active: false
        }),
        computed: {
            targetCaption () {
                switch (this.mode) {
                    case 'hours': return 'часовую ставку'
                    case 'sales': return 'ставку на оборот'
                    case 'chief': return 'ставку на руководящий оборот'
                }
            },
            targetField: {
                get: function () {
                    return +this.user[this.targetFieldName]
                } ,
                set: function (value) {
                    this.user[this.targetFieldName] = +value
                }
            },
            targetFieldName () {
                switch (this.mode) {
                    case 'hours': return 'hour_rate'
                    case 'sales': return 'sales_rate'
                    case 'chief': return 'chief_rate'
                }
            }
        },
        methods: {
            saveRate () {
                this.$store.dispatch('updateUserRate', {
                    user_id: this.user.id,
                    field_name: this.targetFieldName,
                    value: this.user[this.targetFieldName]
                })
                    .then(() => this.active = false)
            },
            activate () {
                this.active = true
            },
            cancel () {
                this.active = false
            }
        }
    }
</script>
<style scoped>
    .changeable {
        cursor: pointer;
    }
</style>
