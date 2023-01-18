<template>
    <v-flex>
        <v-menu
            :close-on-content-click="false"
            :nudge-right="40"
            lazy
            transition="scale-transition"
            offset-y
            full-width
            min-width="290px"
            v-model="menu"
        >
            <template v-slot:activator="{ on }">
                <span class="clickable"
                      :title="hint"
                      v-on="on"
                >
                    {{ value | moment('DD MMMM YYYY г.') }}
                </span>

            </template>
            <v-date-picker v-model="value" no-title scrollable
                           @change=""
                           locale="ru"
                           first-day-of-week="1"
            >
            </v-date-picker>
        </v-menu>
    </v-flex>
</template>
<script>
    export default {
        name: 'DateUpdater',
        props: ['user', 'field'],
        data: () => ({
            menu: false
        }),
        computed: {
            value: {
                get () {
                    return this.user && this.field && this.user[this.field] || ''
                },
                set (val) {
                    this.$store.dispatch('updateUserDate', {
                        user_id: this.user.id,
                        field: this.field,
                        date: val
                    })
                        .then(() => {
                            this.menu = false
                            this.$emit('updated', this.report)
                        })
                }
            },
            hint () {
                return `Редактировать дату ${{created_at: 'приема', fired_at: 'увольнения'}[this.field]} сотрудника ${this.user.full_name}`
            },
            report () {
                return `Дата ${{created_at: 'приема', fired_at: 'увольнения'}[this.field]} сотрудника ${this.user.full_name} изменена`
            }
        }
    }
</script>
<style scoped>
    .clickable {
        cursor: pointer;
    }
    .clickable:hover {
        font-weight: bold;
        color: #1b4b72;
    }
</style>
