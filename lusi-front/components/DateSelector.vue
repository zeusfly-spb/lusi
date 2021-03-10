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
        mdi-arrow-left
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
        mdi-arrow-right
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<script>
export default {
  name: 'DateSelector',
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
  },
  methods: {
    toPrev () {

    },
    toNext () {

    },
    datePicked (date) {

    }
  }
}
</script>

<style scoped>

</style>
