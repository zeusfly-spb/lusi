<template>
    <v-flex align-center row>
        <v-tabs
            v-if="isAuth"
            fixed-tabs
        >
            <v-tab
                v-for="(tab, index) in tabs"
                :to="{path: tab.href, query: {... $route.query}}"
                :key="index"
                router
            >
                <v-badge
                    color="red"
                    v-if="tab.href === '/leads' && waitingLeadsCount"
                >
                    <template v-slot:badge>
                        <span>{{ waitingLeadsCount }}</span>
                    </template>
                    {{ tab.title }}
                </v-badge>
                <span v-else>{{ tab.title }}</span>
            </v-tab>
        </v-tabs>
        <audio
            autoplay
            v-if="beep"
            :src="`${basePath}/beep.wav`"
        />
    </v-flex>

</template>
<script>
    export default {
        name: 'AppMenu',
        data: () => ({
            adminTabs: [
                {title: 'Учет на день', href: '/daily'},
                {title: 'База клиентов', href: '/customers' },
                {title: 'Склад', href: '/stock'},
                {title: 'Заявки', href: '/leads'},
                {title: 'Запись', href: '/appointments'},
                {title: 'Зарплата', href: '/salary'},
                {title: 'Администрация', href: '/admin'}
            ],
            logistTabs: [
                {title: 'Учет на день', href: '/daily'},
                {title: 'Склад', href: '/stock'}
            ]
        }),
        computed: {
            callCenter () {
                return this.$store.getters.callCenter
            },
            salaryVisible () {
                return this.$store.state.settings.data.salaryPage.visible
            },
            isSuperadmin () {
                return this.$store.getters.isSuperadmin
            },
            waitingLeadsCount () {
                return this.$store.getters.waitingLeadsCount
            },
            regularTabs () {
                let base = this.salaryVisible ? this.adminTabs.filter(item => item.href !== '/admin') : this.adminTabs.filter(item => item.href !== '/salary' && item.href !== '/admin')
                if (this.callCenter) {
                    return base.filter(item => item.href !== '/customers' && item.href !== '/stock')
                }
                return base
            },
            tabs () {
                if (this.$store.getters.logist) {
                    return this.logistTabs
                }
                return this.isSuperadmin ? this.adminTabs : this.regularTabs
            },
            basePath () {
                return this.$store.state.basePath
            },
            isAuth () {
                return this.$store.getters.isAuth
            },
            beep () {
                return this.$store.state.loader.beep
            }
        }
    }
</script>
