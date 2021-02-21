import Vue from 'vue'

export default {
    state: {
        currentPage: 'daily',
        tasks: []
    },
    actions: {
        setCurrentPage ({commit}, pageName) {
            commit('SET_CURRENT_PAGE', pageName)
        }
    },
    mutations: {
        REMOVE_TASK (state, task) {
            let target = state.tasks.find(item => item === task)
            delete state.tasks[state.tasks.indexOf(target)]
            state.tasks = state.tasks.filter(item => !!item)
        },
        ADD_TASK (state, task) {
            state.tasks.push(task)
        },
        SET_CURRENT_PAGE (state, pageName) {
            state.currentPage = pageName
        }
    },
    getters: {
        currentPage: state => state.currentPage,
        busy: state => {
            let pageTasks = state.tasks.filter(item => item === state.currentPage)
            return !!pageTasks.length
        }
    }
}
