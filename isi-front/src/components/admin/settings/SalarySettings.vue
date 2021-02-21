<template>
    <v-card class="round-corner" style="height: 400px">
        <v-snackbar
            v-model="snackbar"
            auto-height
            top
            :timeout="3000"
            :color="snackColor"
        >
            <span>{{ snackText }}</span>
        </v-snackbar>
        <v-card-title class="light-blue darken-3"
                      style="height: 2em; margin: 0; padding: 0"
        >
            <span class="subheading white--text"
                  style="margin: 0 1em"
            >
                Настройки показа страницы зарплаты
            </span>
        </v-card-title>
        <v-card-text>
            <v-switch v-model="visible" label="Показывать страницу зарплаты"/>
            <v-checkbox
                v-model="showPersonal"
                label="Персональные данные"
                :disabled="!visible"
            />
            <v-checkbox
                v-model="showOther"
                label="Данные остальных"
                :disabled="!visible"
            />
            <v-checkbox
                v-model="showTotal"
                label="Общие данные"
                :disabled="!visible"
            />
            <v-checkbox
                v-model="showChief"
                label="Данные руководителя"
                :disabled="!visible"
            />
        </v-card-text>

    </v-card>
</template>
<script>
    export default {
        name: 'SalarySettings',
        data: () => ({
            snackColor: 'green',
            snackText: '',
            snackbar: false
        }),
        computed: {
            base () {
                return this.$store.state.settings.data
            },
            showChief: {
                get () {
                    return this.base.salaryPage.showChief
                },
                set (val) {
                    let allData = {...this.base, salaryPage: {...this.base.salaryPage, showChief: val}}
                    this.$store.dispatch('updateSetting', {data: allData})
                        .then(() => this.showSnack('Изменена видимость данных руководителя', 'green'))
                }
            },
            showTotal: {
                get () {
                    return this.base.salaryPage.showTotal
                },
                set (val) {
                    let allData = {...this.base, salaryPage: {...this.base.salaryPage, showTotal: val}}
                    this.$store.dispatch('updateSetting', {data: allData})
                        .then(() => this.showSnack('Изменена видимость общих данных островка', 'green'))
                }
            },
            showOther: {
                get () {
                    return this.base.salaryPage.showOther
                },
                set (val) {
                    let allData = {...this.base, salaryPage: {...this.base.salaryPage, showOther: val}}
                    this.$store.dispatch('updateSetting', {data: allData})
                        .then(() => this.showSnack('Изменена видимость данных зарплаты других сотрудников', 'green'))
                }
            },
            showPersonal: {
                get () {
                    return this.base.salaryPage.showPersonal
                },
                set (val) {
                    let allData = {...this.base, salaryPage: {...this.base.salaryPage, showPersonal: val}}
                    this.$store.dispatch('updateSetting', {data: allData})
                        .then(() => this.showSnack('Изменена видимость персональных данных зарплаты для сотрудников', 'green'))
                }
            },
            visible: {
                get () {
                    return this.base.salaryPage.visible
                },
                set (val) {
                    let allData = {...this.base, salaryPage: {...this.base.salaryPage, visible: val}}
                    this.$store.dispatch('updateSetting', {data: allData})
                        .then(() => this.showSnack('Изменена видимость страницы зарплаты для сотрудников', 'green'))
                }
            }
        },
        methods: {
            showSnack (text, color) {
                this.snackColor = color
                this.snackText = text
                this.snackbar = true
            }
        }
    }
</script>
<style scoped>
    .round-corner{
        border-radius: 5px;
    }
</style>
