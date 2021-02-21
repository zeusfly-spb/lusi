<template>
    <v-flex>

    </v-flex>
</template>
<script>
    export default {
        name: 'QueryInspector',
        computed: {
            islands () {
                return this.$store.state.islands
            },
            islandIds () {
                return this.$store.state.islands.map(item => item.id)
            },
            workingIslandId () {
                return this.$store.state.workingIslandId
            },
            accountingDate () {
                return this.$store.state.accountingDate
            },
            realDate () {
                return this.$store.state.realDate
            }
        },
        methods: {
            inspectQuery (val) {
                let dateRegexp = /\d{4}(-|\/)\d{2}(-|\/)\d{2}/g
                if (val.date) {
                    if (dateRegexp.test(val.date) && val.date !== this.accountingDate) {
                        this.$store.dispatch('changeAccountingDate', val.date)
                    } else {
                        if (this.$store.state.accountingDate === this.$store.state.realDate) {
                            let removed = {}
                            for (let key in this.$route.query) {
                                if (key !== 'date') {
                                    removed[key] = this.$route[key]
                                }
                            }
                            this.$router.replace({query: removed})
                        } else {
                            this.$router.replace({query: {... this.$route.query, date: this.$store.state.accountingDate}})
                        }
                    }
                }
                if (val.island) {
                    this.$router.replace({query: {... this.$route.query, island: val.island}})
                }
            }
        },
        mounted () {
            this.inspectQuery(this.$route.query)
        },
        watch: {
            islands (val) {
                if (val && val.length) {
                    if (this.$route.query.island && this.islandIds.includes(+this.$route.query.island) && this.workingIslandId !== +this.$route.query.island) {
                        this.$store.dispatch('setWorkingIslandId', +this.$route.query.island)
                    }
                }
            },
            workingIslandId (val) {
                if (+val) {
                    this.$router.replace({query: {... this.$route.query, island: val}})
                }
            },
            accountingDate (val) {
                this.$router.replace({query: {...this.$route.query, date: val}})
            },
            '$route.query': function (val) {
                this.inspectQuery(val)
            },
            '$route.query.island': function (val) {
                if (this.workingIslandId !== +val) {
                    this.$store.dispatch('setWorkingIslandId', +val)
                }
            }
        }
    }
</script>
