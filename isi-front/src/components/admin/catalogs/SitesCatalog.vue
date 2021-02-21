<template>
    <v-flex xs12 sm12 md12>
        <v-card class="round-corner">
            <v-card-title class="light-blue darken-3"
                          style="height: 2em; margin: 0; padding: 0"
            >
                <span class="subheading white--text"
                      style="margin: 0 1em"
                >
                    Сайты
                </span>
            </v-card-title>
            <v-card-text>
                <v-flex>
                    <sites-commander/>
                    <v-data-table
                        :items="sites"
                        :headers="headers"
                        hide-actions
                    >
                        <template v-slot:items="props">
                            <tr>
                                <td
                                    class="index"
                                >
                                    {{ props.index + 1 }}
                                </td>
                                <td>{{ props.item.url }}</td>
                                <td>{{ props.item.description }}</td>
                                <td
                                    align="right"
                                >
                                    <sites-catalog-controls
                                        :site="props.item"
                                    />
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-flex>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    import SitesCommander from './SitesCommander'
    import SitesCatalogControls from './SitesCatalogControls'
    export default {
        name: 'SitesCatalog',
        data: () => ({
            headers: [
                {text: '#', sortable: false},
                {text: 'url', sortable: false},
                {text: 'Описание', sortable: false},
                {text: 'Действия', sortable: false, align: 'right'}
            ]
        }),
        computed: {
            sites () {
                return this.$store.state.catalog.sites
            }
        },
        components: {
            SitesCommander,
            SitesCatalogControls
        }
    }
</script>

<style scoped>
    .index {
        width: 2em;
    }
</style>
