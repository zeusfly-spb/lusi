<template>
    <v-flex>
        <span
            :class="{touchable: allowed}"
            v-if="!active"
            @click="activate"
            :title="allowed ? 'Изменить островок привязки' : 'Чтобы изменить островок привязки, смените статус'"
        >
            {{ access.island && access.island.name || 'Без островка' }}
        </span>
        <v-select
            height="1em"
            autofocus
            v-else
            :items="islands"
            v-model="access.island_id"
            item-text="name"
            item-value="id"
            single-line
            @change="updateAccess"
            @blur="cancel"
        />
    </v-flex>
</template>
<script>
    export default {
        name: 'AccessIslandChanger',
        props: ['access'],
        data: () => ({
            active: false
        }),
        computed: {
            allowed () {
                return this.access.status && this.access.status === 'allowed'
            },
            islands () {
                return [{id: null, name: 'Без островка'}, ... this.$store.state.islands]
            }
        },
        methods: {
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            },
            cancel () {
                this.deactivate()
            },
            updateAccess () {
                this.$store.dispatch('updateAccessIsland', {
                    access_id: this.access.id,
                    island_id: this.access.island_id
                })
                    .then((res) => {
                        this.deactivate()
                        let islandName = res.data.island && res.data.island.name || null
                        let info = !islandName ? `От доступа отвязан островок` : `К доступу привязан островок ${islandName}`
                        this.$store.dispatch('pushMessage', {text: info})
                    })
            }
        }
    }
</script>
<style scoped>
    .touchable {
        cursor: pointer;
        opacity: .7;
    }
    .touchable:hover {
        opacity: 1;
    }
</style>
