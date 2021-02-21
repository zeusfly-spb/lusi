<template>
    <v-flex>
        <strong
            v-if="!active"
            @click="activate"
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
            @blur="deactivate"
            @keyup.esc="deactivate"
            @keyup.enter="updateRate"
        />
    </v-flex>
</template>
<script>
    export default {
        name: 'MonthRateEditor',
        props: ['user', 'type'],
        data: () => ({
            active: false,
        }),
        computed: {
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            rates () {
                return this.user && this.user.rates
            },
            currentMonth () {
                return this.$store.state.accountingDate && this.$store.state.accountingDate.split('-').slice(0, 2).join('-') || null
            },
            targetCaption () {
                switch (this.type) {
                    case 'hours': return 'часовую ставку'
                    case 'sales': return 'ставку на оборот'
                    case 'chief': return 'руководящий коэффициент'
                    case 'records': return 'ставку на запись'
                    case 'services': return 'ставку на услуги'
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
                switch (this.type) {
                    case 'hours': return 'hour_rate'
                    case 'sales': return 'sales_rate'
                    case 'chief': return 'chief_rate'
                    case 'records': return 'records_rate'
                    case 'services': return 'services_rate'
                }
            }
        },
        methods: {
            updateRate () {
                let value = +this.user[this.targetFieldName]
                let exists = this.rates && this.rates
                    .find(item => item.month === this.currentMonth && item.type === this.type && item.island_id === this.workingIslandId) || null
                let updated
                if (exists) {
                    updated = this.rates
                        .map(item => item.month === this.currentMonth && item.type === this.type && item.island_id === this.workingIslandId ? {... item, value: value} : item)
                } else {
                    if (this.rates) {
                        this.rates.push({type: this.type, month: this.currentMonth, island_id: this.workingIslandId, value: value})
                        updated = this.rates
                    } else {
                        updated = [{type: this.type, month: this.currentMonth, island_id: this.workingIslandId, value: value}]
                    }
                }

                const getRateName = type => ({
                    hours: 'часовая ставка',
                    sales: 'ставка на оборот',
                    chief: 'ставка руководителя',
                    records: 'ставка на запись',
                    services: 'ставка на услуги'
                }[type])

                this.$store.dispatch('updateUserRates', {
                    user_id: this.user.id,
                    rates: updated
                })
                    .then(() => {
                        let rateName = getRateName(this.type)
                        let monthName = this.$moment(this.currentMonth + '-01').format('MMMM YYYY')
                        let text = `Изменена ${rateName} для сотрудника
                                    ${this.user.full_name} за ${monthName} г. на островке "${this.$store.getters.workingIsland.name}"`

                        this.deactivate()
                        this.$store.dispatch('pushMessage', {text: text})
                    })
            },
            activate () {
                this.active = true
            },
            deactivate () {
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
