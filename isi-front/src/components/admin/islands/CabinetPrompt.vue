<template>
    <v-flex>
        <v-dialog
            persistent
            v-model="visible"
            max-width="800px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title
                    class="orange darken-3"
                >
                    <span class="title white--text">
                        {{ promptHeader }}
                    </span>
                </v-card-title>
                <v-card-text>
                    <span
                        class="headline"
                    >
                        {{ promptText }}
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer/>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="cancelAction">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="performAction">Продолжить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'CabinetPrompt',
        props: ['island', 'prompt', 'toDelete'],
        data: () => ({
            visible: false,
            mode: ''
        }),
        computed: {
            promptHeader () {
                return {
                    first: 'ВНИМАНИЕ! ПЕРВЫЙ КАБИНЕТ',
                    last: 'ВНИМАНИЕ! ПОСЛЕДНИЙ КАБИНЕТ'
                }[this.mode]
            },
            promptText () {
                return {
                    first: `На островке ${this.island.name} добавляется первый кабинет и все записи будут назначены на него`,
                    last: `На островке ${this.island.name} удаляется последний кабинет и все записи получат назначение "без кабинета"`
                }[this.mode]
            }
        },
        methods: {
            performAction () {
                this.visible = false
                this.$emit('action', this.mode)
            },
            cancelAction () {
                this.visible = false
                this.$emit('cancel', this.mode)
            }
        },
        watch: {
            prompt (val) {
                if (val) {
                    this.visible = true
                    this.mode = val
                }
            }
        }
    }
</script>
