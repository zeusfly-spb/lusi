export default {
    state: {
        page: 1,
        per_page: 15,
        total: 0,
        last_page: 0,
        current_page: 0,
        loading: false
    },
    actions: {
        updatePagination ({commit, dispatch, rootState}, data) {
            return new Promise((resolve, reject) => {
                commit('SET_SCAN_MODE', {...rootState.scanMode, leads: false})
                commit('SET_PAGINATOR_LOADING', true)
                commit('UPDATE_PAGINATION', data)
                dispatch('setLeadsOnTimer')
                    .then(res => resolve(res))
                    .catch(e => reject(e))
                    // .finally(() => {
                    //     commit('SET_PAGINATOR_LOADING', false)
                    //     commit('SET_SCAN_MODE', {...rootState.scanMode, leads: true})
                    // })
            })
        }
    },
    mutations: {
        RESET_PAGINATOR (state) {
            state.page = 1
            state.per_page = 15
            state.total = 0
            state.last_page = 0
            state.current_page = 0
        },
        SET_PAGINATOR_LOADING (state, val) {
            state.loading = val
        },
        SYNC_PAGINATION (state, sync) {
            state.total = sync.total
            state.last_page = sync.lastPage
            state.per_page = sync.perPage
            state.page = sync.currentPage
        },
        UPDATE_PAGINATION (state, data) {
            state.page = data.page || 1
            state.per_page = data.rowsPerPage || -1
        }
    },
    getters: {
        paginator_page: state => state.page,
        paginator_per_page: state => state.per_page
    }
}
