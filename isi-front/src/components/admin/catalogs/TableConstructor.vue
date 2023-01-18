<template>
    <v-flex xs12 sm12 md12>
        <v-card class="round-corner">
            <v-card-title
                    class="light-blue darken-3"
                    style="height: 2em; margin: 0; padding: 0"
            >
                <span class="subheading white--text"
                      style="margin: 0 1em"
                >
                    Конструктор таблиц
                </span>
            </v-card-title>
            <v-card-text>
                <v-data-table
                        :items="tables"
                        :headers="headers"
                        hide-actions
                >
                    <template v-slot:items="props">
                        <tr>
                            <td>{{ props.index + 1 }}</td>
                            <td>{{ props.item.name }}</td>
                            <td>{{ props.item.description }}</td>
                            <td>Поля</td>
                            <td>Действия</td>
                        </tr>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-flex>
</template>

<script>
    export default {
        name: 'TableConstructor',
        data: () => ({
            headers: [
                {text: '#', sortable: false},
                {text: 'Название', sortable: false},
                {text: 'Описание', sortable: false},
                {text: 'Поля', sortable: false},
                {text: 'Действия', sortable: false, align: 'right'}
            ]
        }),
        computed: {
            tables () {
                return []
            }
        }
    }
</script>

<style scoped>

</style>
