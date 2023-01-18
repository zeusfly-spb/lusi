<template>
    <span>
        <span
            :class="{
                'open': open,
                'closed': !open
            }"
        >
            {{ displayPhone }}
        </span>
        <v-icon
            small
            class="clickable"
            v-if="isSuperAdmin"
            :class="{
                'grey--text': open,
                'grey--text text--lighten-1': !open
            }"
            :title="open ? 'Скрыть номер' : 'Показать номер'"
            @click="open = !open"
        >
            {{ open ? 'visibility_off' : 'visibility' }}
        </v-icon>
    </span>
</template>
<script>
    export default {
        name: 'PhoneViewer',
        props: ['phone'],
        data: () => ({
            open: false
        }),
        computed: {
            isSuperAdmin () {
                return this.$store.getters.isSuperadmin
            },
            displayPhone () {
                return this.open ? this.$options.filters.openPhone(this.phone)
                    : this.phone[0] === '+' ? this.$options.filters.externalPhone(this.phone)
                        : this.$options.filters.phone(this.phone)
            }
        }
    }
</script>
<style scoped>
    .open {
        color: black;
    }
    .closed {
        opacity: .8;
    }
</style>
