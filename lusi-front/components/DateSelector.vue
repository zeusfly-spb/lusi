<template>
  <v-layout
    v-if="accountingDate"
    align-baseline
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
        transition="scale-transition"
        offset-y
        min-width="290px"
        v-model="menu"
      >
        <template v-slot:activator="{ on }">
          <div
            :style="{width: `${labelLength * .55}em`}"
          >
            <v-text-field
              :class="{'today': isToday}"
              :label="labelText"
              readonly
              v-on="on"
            >
              <template
                slot="label"
              >
                <div
                  :class="{
                        'today': isToday,
                        'future': isFuture,
                        'past': isPast
                    }"
                >
                    {{ labelText }}
                </div>
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
import {mapActions, mapState, mapGetters} from "vuex"
export default {
  name: 'DateSelector',
  data: () => ({
    date: '',
    menu: false,
    mask: 'D MMMM YYYY г.'
  }),
  computed: {
    ...mapState({
      accountingDate: "accountingDate"
    }),
    ...mapGetters({
      isToday: "isToday",
      isFuture: "isFuture",
      isPast: "isPast",
      validDate: "validDate"
    }),
    isMobile () {
      return ['xs', 'sm'].includes(this.$vuetify.breakpoint.name)
    },
    labelText () {
      return this.$moment(this.accountingDate).format(this.mask) || ''
    },
    labelLength () {
      return this.labelText.length || 0
    }
  },
  methods: {
    ...mapActions({
      changeAccountingDate: 'changeAccountingDate'
    }),
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
    async datePicked (date) {
      this.$router.replace({path: this.$route.path, query: {date: date}})
      this.menu ? this.menu = false : null
    }
  },
  watch: {
    '$route.query': async function (val) {
      if (val.date && this.validDate(val.date)) {
        await this.changeAccountingDate(val.date)
      }
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
