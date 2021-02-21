<template>
    <v-flex>
        <v-tabs
            slider-color="red"
            @change="loadTabContent"
        >
            <v-tab
                v-for="item in sections"
                :key="item.id"
            >
                {{ item.label }}
            </v-tab>
            <v-tabs-items touchless>
                <v-tab-item
                    v-for="item in sections"
                    :key="item.id"
                >
                    <users-control v-if="item.id === 1"></users-control>
                    <groups-control v-if="item.id === 2"></groups-control>
                    <islands-control v-if="item.id === 3"></islands-control>
                    <accesses-control v-if="item.id === 4"></accesses-control>
                    <catalog-control v-if="item.id === 5"></catalog-control>
                    <settings-control v-if="item.id === 6"></settings-control>
                </v-tab-item>
            </v-tabs-items>
        </v-tabs>
    </v-flex>

</template>

<script>
    import UsersControl from './UsersControl'
    import GroupsControl from './GroupsControl'
    import AccessesControl from './AccessesControl'
    import IslandsControl from './IslandsControl'
    import SettingsControl from './SettingsControl'
    import CatalogControl from './CatalogControl'

    export default {
        name: 'AdminPanel',
        data: () => ({
            sections: [
                {id: 1, label: 'Сотрудники'},
                {id: 2, label: 'Группы'},
                {id: 3, label: 'Островки'},
                {id: 4, label: 'Доступы'},
                {id: 5, label: 'Каталог'},
                {id: 6, label: 'Настройки'}
            ],
            activeSection: 1
        }),
        computed: {
            users () {
                return this.$store.state.users
            }
        },
        methods: {
            loadTabContent (index) {
                switch (index) {
                    case 0: this.$store.dispatch('setUsers')
                        break
                    case 1: this.$store.dispatch('setGroups')
                        break
                    case 2: this.$store.dispatch('setIslands')
                        break
                    case 3: this.$store.dispatch('setAccessRequests')
                        break
                }
            }
        },
        components: {
            UsersControl,
            GroupsControl,
            AccessesControl,
            IslandsControl,
            SettingsControl,
            CatalogControl
        }
    }
</script>
