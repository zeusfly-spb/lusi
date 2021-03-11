const Cookies = require('js-cookie')

export const state = () => ({
  accountingDate: null,
  realDate: null
})

export const actions = {
  async setAccountingDate ({commit}) {
    try {
      let date
      const savedDate = Cookies.get('accounting-date')
      if (savedDate) {
        date = savedDate
      } else {
        const res = await this.$axios.post('/api/get_accounting_date')
        date = res.data.date
      }
      commit('SET_ACCOUNTING_DATE', date)
      Cookies.set('accounting-date', date)
    } catch (e) {
      return Promise.reject(new Error(`Accounting Date set Error: ${e}`))
    }
  },
  async setRealDate ({commit}) {
    try {
      const res = await this.$axios.post('/api/get_accounting_date')
      commit('SET_REAL_DATE', res.data.date)
    } catch (e) {
      return Promise.reject(new Error(`Real Date set Error: ${e}`))
    }

  },
  changeAccountingDate ({commit}, date) {
    commit('SET_ACCOUNTING_DATE', date)
    Cookies.set('accounting-date', date)
  }
}

export const mutations = {
  SET_REAL_DATE (state, date) {
    state.realDate = date
  },
  SET_ACCOUNTING_DATE (state, date) {
    state.accountingDate = date
  }
}

export const getters = {
  validDate: state => date => /[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/.test(date),
  isToday: state => state.accountingDate === state.realDate,
  isFuture: state => state.accountingDate > state.realDate,
  isPast: state => state.accountingDate < state.realDate
}
