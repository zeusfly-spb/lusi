import Vue from 'vue'

export default {
    state: {
        switching: false,
        attemptToEvent: null,
        leadToDelete: null,
        leadCommentsId: null,
        openLeadId: null,
        interactionsOpenId: null,
        message: null,
        menuOpenId: null,
        sortByPostpones: (a, b) => {
            if (!!a.last_postpone && !!b.last_postpone) {
                let timeA = parseFloat(new Date(a.last_postpone.date))
                let timeB = parseFloat(new Date(b.last_postpone.date))
                return timeA === timeB ? 0 : timeA < timeB ? 1 : -1
            }
            if (!a.last_postpone) {
                if (!b.last_postpone) {
                    return 0
                } else {
                    return -1
                }
            }
            if (!b.last_postpone) {
                if (!a.last_postpone) {
                    return 0
                } else {
                    return 1
                }
            }
        },
        moveFutureDown: (a, b) => {
            if (!a.last_postpone || !b.last_postpone) {
                return 0
            }
            let timeA = a.last_postpone.date.split(' ')[0]
            let timeB = b.last_postpone.date.split(' ')[0]
            return timeA === timeB ? 0 : timeA < timeB ? -1 : 1
        },
        sortByTimeInDay: (a, b) => {
            if (!a.last_postpone || !b.last_postpone) {
                return 0
            }
            if (!a.last_postpone.date.split(' ')[0] !== !b.last_postpone.date.split(' ')[0]) {
                return 0
            }
            let timeA = a.last_postpone.date.split(' ')[1]
            let timeB = b.last_postpone.date.split(' ')[1]
            return timeA === timeB ? 0 : timeA < timeB ? -1 : 1
        },
        withoutTZ: date => date.includes('.') ? date.split('.')[0] : date
    },
    mutations: {
        SET_LEADS_SWITCHING (state, mode) {
            state.switching = mode
        },
        REMOVE_ATTEMPT_TO_EVENT (state) {
            state.attemptToEvent = null
        },
        SET_ATTEMPT_TO_EVENT (state, attempt) {
            state.attemptToEvent = attempt
        },
        SET_LEAD_TO_DELETE (state, lead) {
            state.leadToDelete = lead
        },
        SET_LEAD_COMMENTS_ID (state, id) {
            state.leadCommentsId = id
        },
        SET_OPEN_LEAD_ID (state, id) {
            state.openLeadId = id
        },
        SET_LEAD_MENU_OPEN_ID (state, id) {
            state.menuOpenId = id
        },
        SET_INTERACTIONS_OPEN_ID (state, id) {
            state.interactionsOpenId = id
        },
        SEND_LEAD_MESSAGE (state, message) {
            state.message = message
            setTimeout(() => state.message = null, 100)
        }
    },
    getters: {
        withoutTZ: state => state.withoutTZ,
        leadsSwitching: state => state.switching,
        postponesSort: state => state.sortByPostpones,
        dateTimeSort: state => state.sortByDateTime,
        futureDownSort: state => state.moveFutureDown
    }
}
