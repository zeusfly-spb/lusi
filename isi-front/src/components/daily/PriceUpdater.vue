<template>
    <span
        @click="editMode = true"
    >
        <span
            v-if="!editMode"
            class="clickable"
            :title="`Изменить сумму ${caption}а сделки`"
        >
            {{ +`${value}` | pretty }}
        </span>
        <v-text-field
            autofocus
            single-line
            maxlength="7"
            style="width: 4em"
            height="1em"
            v-model="value"
            v-if="editMode"
            @blur="cancel"
            @keyup.esc="cancel"
            @keyup.enter="updatePrice"
        />
    </span>
</template>
<script>
    export default {
        name: 'PriceUpdater',
        props: {
            deal: Object,
            mode: String
        },
        data: () => ({
            value: 0,
            editMode: false
        }),
        computed: {
            caption () {
                return {income: 'приход', expense: 'расход'}[this.mode]
            }
        },
        methods: {
            cancel () {
                this.editMode = false
            },
            updatePrice () {
                this.$store.dispatch('updateDealPrice', {
                    deal_id: this.deal.id,
                    field: this.mode,
                    amount: this.value
                })
                    .then(() => this.$store.dispatch('pushMessage', {
                        text: `Значение ${this.mode === 'income' ? 'Приход' : 'Расход'} у сделки изменено`,
                        color: 'green'
                    }))
                    .finally(() => this.editMode = false)
            },
            getBaseValue () {
                this.value = this.deal && this.mode && this.deal[this.mode] || 0
            }
        },
        mounted () {
            this.getBaseValue()
        },
        watch: {
            deal () {
                this.getBaseValue()
            },
            editMode (val) {
                this.$store.commit('SET_SCAN_MODE', {...this.$store.state.scanMode, deals: !val})
                if (!val) {
                    this.getBaseValue()
                }
            }
        }
    }
</script>
