<template>
    <v-flex>
        <span>
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
                    <span
                        v-on="on"
                        :class="{'grey--text': menu}"
                        class="clickable"
                    >
                        {{ date | moment('DD MMMM YYYY г.') }}
                    </span>
                </template>
                <v-date-picker
                    :value="date" no-title scrollable
                    @change="datePicked"
                    locale="ru"
                    first-day-of-week="1"
                />
            </v-menu>
        </span>
    </v-flex>
</template>
<script>
    export default {
        name: 'chiefAppointmentDateChanger',
        props: ['island', 'chiefIndex'],
        data: () => ({
            menu: false
        }),
        computed: {
            date () {
                return this.island && this.island.chiefs && this.island.chiefs[this.chiefIndex]['date'] || ''
            }
        },
        methods: {
            datePicked (val) {
                if (!this.island.chiefs) return
                let chiefs = JSON.parse(JSON.stringify(this.island.chiefs))
                chiefs[this.chiefIndex]['date'] = val
                this.$store.dispatch('updateIslandChiefs', {
                    island_id: this.island.id,
                    chiefs: chiefs
                })
                    .then(() => {
                        this.menu = false
                        this.$emit('updated', {user_id: this.island.chiefs[this.chiefIndex]['user_id'], date: val})
                    })
            }
        }
    }
</script>
