export const state = () => ({
  accountingDate: null
})

export const actions = {
  setAccountingDate ({commit}) {
    this.$axios.post('/api/get_accounting_date')
      .then(res => commit('SET_ACCOUNTING_DATE', res.data.date))
  }
}

export const mutations = {
  SET_ACCOUNTING_DATE(state, date) {
    state.accountingDate = date
  }
}
