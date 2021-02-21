<template>
    <div
            class="controls m-0 p-0"
    >
        <v-icon
                small
                :color="used ? 'grey lighten-1' : 'blue'"
                class="clickable"
                :title="used ? `Невозможно редатировать сайт, используемый для фильтрации в данный момент!` : `Редактировать сайт ${site.url}`"
                @click="toEdit"
        >
            edit
        </v-icon>
        <v-icon
                small
                :color="used ? 'grey lighten-1' : 'red'"
                class="clickable"
                :title="used ? `Невозможно удалить сайт, используемый для фильтрации в данный момент!` : `Удалить сайт ${site.url}`"
                @click="toDelete"
        >
            delete
        </v-icon>
    </div>

</template>

<script>
    export default {
        name: 'SitesCatalogControls',
        props: {
            site: Object
        },
        computed: {
            used () {
                return this.$store.getters.usedLeadFilterSites.includes(this.site.url)
            }
        },
        methods: {
            toDelete () {
                if (this.used) {
                    return
                }
                this.$store.commit('SET_SITE_TO_DELETE', this.site)
            },
            toEdit () {
                if (this.used) {
                    return
                }
                this.$store.commit('SET_SITE_TO_EDIT', this.site)
            }
        }
    }
</script>

<style scoped>
    .controls {
        display: inline-flex;
    }
</style>
