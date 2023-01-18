export default {
    state: {
        inspectingIslandId: null
    },
    actions: {
        setInspectingIsland ({commit}, island) {
            try {
                commit('SET_INSPECTING_ISLAND_ID', island.id)
                return Promise.resolve(island.id)
            } catch (e) {
                return Promise.reject(e)
            }
        }
    },
    mutations: {
        SET_INSPECTING_ISLAND_ID (state, id) {
            state.inspectingIslandId = id
        }
    },
    getters: {
        inspectingIslandId: state => state.inspectingIslandId,
        inspectingIsland: (state, getters) => getters.allIslands.find(item => +item.id === +state.inspectingIslandId)
    }
}
