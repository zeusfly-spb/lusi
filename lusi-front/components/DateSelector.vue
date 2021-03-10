<template>
  <v-layout
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
        lazy
        transition="scale-transition"
        offset-y
        full-width
        min-width="290px"
        v-model="menu"
      >
        <template v-slot:activator="{ on }">
          <div
            :style="{width: `${labelLength * .6}em`}"
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
                <div
                  :class="{
                        'today': isToday,
                        'future': isFuture,
                        'past': isPast
                    }"
                >
                    {{ accountingDate | moment('D MMMM YYYY г.') }}
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
import {mapActions, mapState} from "vuex"
export default {
  name: 'DateSelector',
  data: () => ({
    date: '',
    menu: false
  }),
  computed: {
    ...mapState({
      accountingDate: "accountingDate"
    }),
    isMobile () {
      return ['xs', 'sm'].includes(this.$vuetify.breakpoint.name)
    },
    isToday () {
      return true
    },
    isFuture () {
      return false
    },
    isPast () {
      return false
    },
    labelText () {
      return this.$moment(this.accountingDate).format('D MMMM YYYY г.') || ''
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

    },
    toNext () {

    },
    async datePicked (date) {
      await this.changeAccountingDate(date)
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
