<template>
    <v-flex>
        <v-icon
            color="green"
            class="clickable"
            @click="activate"
            :title="`Добавить наименование документа для сотрудника ${user.full_name}`"
        >
            note_add
        </v-icon>
        <v-dialog
            v-model="active"
            max-width="500px"
        >
            <v-card
                class="round-corner"
            >
                <v-card-title class="light-blue darken-3">
                    <span class="title white--text">Добавить наименование документа</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field
                        autofocus
                        v-model="name"
                        label="Наименование документа"
                        data-vv-as="Наименование документа"
                        data-vv-name="docName"
                        :error-messages="errors.collect('docName')"
                        v-validate="'required'"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="darken-1" flat @click="deactivate">Отмена</v-btn>
                    <v-btn color="green darken-1" flat @click="createDocName">Сохранить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-flex>
</template>
<script>
    export default {
        name: 'CustomDocAdder',
        props: ['user'],
        data: ()=> ({
            active: false,
            name: ''
        }),
        methods: {
            createDocName () {
                this.$validator.validate()
                    .then(res => {
                        if (!res) return
                        this.$store.dispatch('addCustomDoc', {
                            id: this.user.document_pack.id,
                            name: this.name
                        })
                            .then(() => {
                                this.deactivate()
                                this.$emit('added', `Добавлено наименование документа ${this.name} для сотрудника ${this.user.full_name}`)
                            })
                    })
            },
            activate () {
                this.active = true
            },
            deactivate () {
                this.active = false
            }
        },
        watch: {
            active (val) {
                this.errors.clear()
                if (!val) {
                    this.name = ''
                }
            }
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
        opacity: .6;
    }
    .clickable:hover {
        opacity: 1;
    }
    .round-corner {
        border-radius: 5px;
    }
</style>
