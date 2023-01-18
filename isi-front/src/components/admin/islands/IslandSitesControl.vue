<template>
    <v-sheet
        class="p-0 m-0 mb-1 ml-2 round-corner"
        elevation="2"
        color="blue-grey lighten-5"
    >
         <span
             class="pl-2 pr-2 text-center body-2"
         >
            Сайты источники заявок
        </span>
        <div
            class="pb-3 pl-1"
        >
            <v-checkbox
                height=".5em"
                v-for="site in sitesCatalog"
                v-model="site.accepted"
                :key="site.id"
                :label="site.url"
                hide-details
                @change="submitSitesList"
            />
        </div>
    </v-sheet>
</template>

<script>
    export default {
        name: 'IslandSitesControl',
        props: { island_id: Number },
        computed: {
            sitesCatalog () {
                let base =  this.$store.state.catalog.sites
                return base.map(item => ({... item, accepted: this.sites.includes(item.url)}))
            },
            sites: {
                get () {
                    const value = () => this.island.options.sites || []
                    return this.island && this.island.options ? value() : []
                },
                set (val) {
                    this.$store.dispatch('setIslandOption', {
                        island_id: this.island.id,
                        key: 'sites',
                        value: val
                    })
                        .finally(() => this.setIsland())
                }
            }
        },
        methods: {
            submitSitesList () {
                const acceptedUrls = () => this.sitesCatalog.filter(site => site.accepted).map(site => site.url)
                this.sites = acceptedUrls()
            },
            setIsland () {
                this.island = this.$store.state.islands.find(item => +item.id === +this.island_id)
            }
        },
        created () {
            this.setIsland()
        }
    }
</script>

<style scoped>

</style>
