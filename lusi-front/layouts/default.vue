<template>
  <v-app>
    <v-app-bar
      v-if="authUser"
      :clipped-left="clipped"
      fixed
      app
    >
      <v-layout
          align-center
          class="p-0 m-0"
          style="padding-left: 0!important; padding-right: 0!important; margin-left: 0!important; margin-right: 0!important;"
      >

        <v-flex
            text-xs-center
        >
          <DateSelector/>
        </v-flex>

        <v-icon
            class="clickable"
            v-if="isAuth"
            title="Выход"
            color="orange darken-2"
            @click="logOut"
            :small="isMobile"
            :large="!isMobile"
        >
          mdi-exit-to-app
        </v-icon>
      </v-layout>


    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="false"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import {mapActions, mapState} from "vuex"
import DateSelector from "@/components/DateSelector"

export default {
  name: 'defaultLayout',
  middleware: 'auth',
  watchQuery: true,
  data: () => ({
    isMobile: false,
    clipped: false,
    drawer: false,
    fixed: false,
    title: 'lusi'
  }),
  computed: {
    ...mapState({
      accountingDate: "accountingDate"
    }),
    isAuth () {
      return this.$auth.loggedIn
    },
    authUser () {
      return this.$auth.user
    }
  },
  async fetch() {
    await this.setAccountingDate()
    await this.setRealDate()
    this.$router.push({path: this.$route.path, query: {date: this.accountingDate}})
  },
  methods: {
    ...mapActions({
      setAccountingDate: "setAccountingDate",
      setRealDate: "setRealDate"
    }),
    logOut () {
      this.$auth.logout()
        .then(() => this.$router.push('/login'))
    }
  },
  components: {
    DateSelector
  }
}
</script>
<style>
.clickable {
  cursor: pointer;
  opacity: .7;
}
.clickable:HOVER {
  opacity: 1;
}
.exit {
  display: flex;
  flex-direction: column-reverse;
}
</style>
