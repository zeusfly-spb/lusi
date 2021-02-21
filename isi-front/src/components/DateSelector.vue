<template>
    <v-layout
        align-center
        justify-center
        row
        fill-height
        class="p-0 m-0"
        style="margin: 0!important; padding: 0!important;"
    >
        <v-btn
            icon
            title="Переключить на предыдущий день"
            @click="toPrev"
            :small="isMobile"
        >
            <v-icon
                :small="isMobile"
            >
                navigate_before
            </v-icon>
        </v-btn>
        <div>
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
                    <div
                        class="date-input"
                    >
                        <v-text-field
                            :class="{'today': isToday}"
                            :label="accountingDate | moment('D MMMM YYYY г.')"
                            prepend-inner-icon="event"
                            readonly
                            v-on="on"
                        >
                            <template
                                slot="label"
                            >
                                <span
                                    :class="{
                                        'today': isToday,
                                        'future': isFuture,
                                        'past': isPast
                                    }"
                                >
                                    {{ accountingDate | moment('D MMMM YYYY г.') }}
                                </span>
                            </template>
                        </v-text-field>
                    </div>
                </template>
                <v-date-picker
                    v-model="date" no-title scrollable
                    @change="datePicked"
                    locale="ru"
                    first-day-of-week="1"
                />
            </v-menu>
        </div>
        <v-btn
            icon
            :small="isMobile"
            title="Переключить на следующий день"
            @click="toNext"
        >
            <v-icon
                :small="isMobile"
            >
                navigate_next
            </v-icon>
        </v-btn>
    </v-layout>

</template>

<script>
    export default {
        data: () => ({
            date: '',
            menu: false
        }),
        computed: {
            isMobile () {
                return ['xs', 'sm'].includes(this.$vuetify.breakpoint.name)
            },
            accountingDate () {
                return this.$store.state.accountingDate
            },
            isToday () {
                return this.$store.getters.isToday
            },
            isFuture () {
                return this.$store.state.accountingDate > this.$store.state.realDate
            },
            isPast () {
                return this.$store.state.accountingDate < this.$store.state.realDate
            }
        },
        methods: {
            toPrev () {
                let current = new Date(this.accountingDate + 'T12:00:00')
                let prev = new Date(this.accountingDate + 'T12:00:00')
                prev.setDate(current.getDate() - 1)
                this.datePicked(prev.toISOString().split('T')[0])
            },
            toNext () {
                let current = new Date(this.accountingDate + 'T12:00:00')
                let next = new Date(this.accountingDate + 'T12:00:00')
                next.setDate(current.getDate() + 1)
                this.datePicked(next.toISOString().split('T')[0])
            },
            datePicked (val) {
                this.$store.dispatch('changeAccountingDate', val)
                this.menu = false
            }
        }
    }
</script>
<style scoped>
    .date-input {
        width: 14em!important;
    }
    .today {
        color: green;
        font-weight: bold;
    }
    .future {
        color: #00B8D4;
    }
    .past {
        color: lightslategrey;
    }
</style>
