<template>
    <v-flex>
        <span
            :class="{'blue-grey--text lighten-1': !vpbxExtension}"
            class="clickable"
            :title="vpbxExtension ? `Изменить код манго для островка ${island && island.name || ''}` : `Задать код манго для островка ${island && island.name || ''}`"
            @click="active = true"
            v-if="!active"
        >
            {{ vpbxExtension || 'Не задан'}}
        </span>
        <v-text-field
            label="Код манго"
            v-else
            single-line
            autofocus
            v-model="vpbxExtension"
            style="display: inline"
            height="1em"
            maxlength="4"
            @blur="active = false"
            @keyup.esc="active = false"
            @keyup.enter="updateIsland"
        />
    </v-flex>
</template>
<script>
    export default {
        name: 'IslandVpbxChanger',
        props: ['island'],
        data: () => ({
            active: false,
            value: null
        }),
        computed: {
            vpbxExtension: {
                get () {
                    return this.island && this.island.vpbx_extension
                },
                set (val) {
                    this.value = val
                }
            }
        },
        methods: {
            updateIsland () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('updateIslandVpbx', {
                            island_id: this.island.id,
                            vpbx_extension: this.value
                        })
                            .then(() => {
                                this.active = false
                                this.$emit('updated', `Изменен код манго для островка ${this.island.name}`)
                            })
                    })

            }
        }
    }
</script>
<style>
    .clickable {
        cursor: pointer;
        opacity: .8;
    }
    .clickable:hover {
        opacity: 1;
    }
</style>
