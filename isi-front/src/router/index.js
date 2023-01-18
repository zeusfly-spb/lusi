import Vue from 'vue'
import VueRouter from 'vue-router'
import {store} from '../store'

const RegisterView = require('../components/RegisterView.vue').default
const LoginView = require('../components/LoginView.vue').default
const AccessView = require('../components/AccessView.vue').default

const DailyAccounting = require('../components/daily/DailyAccounting.vue').default
const CustomerPanel = require('../components/customers/CustomerPanel.vue').default
const StockPanel = require('../components/stock/StockPanel.vue').default
const LeadsPanel = require('../components/leads/LeadPanel.vue').default
const SalaryPanel = require('../components/salary/SalaryPanel.vue').default
const AdminPanel = require('../components/admin/AdminPanel.vue').default
const AppointmentPanel = require('../components/appointments/AppointmentPanel.vue').default

Vue.use(VueRouter)

const routes = [
    {
        path: '/register',
        component: RegisterView,
        meta: {title: 'Регистрация', auth: false}
    },
    {
        path: '/login',
        component: LoginView,
        meta: {title: 'Авторизация', auth: false}
    },
    {
        path: '/access',
        component: AccessView,
        meta: {title: 'Доступы', auth: true}
    },
    {
        path: '/daily',
        component: DailyAccounting,
        meta: {title: 'Учет на день', auth: true}
    },
    {
        path: '/customers',
        component: CustomerPanel,
        meta: {title: 'База клиентов', auth: true}
    },
    {
        path: '/stock',
        component: StockPanel,
        meta: {title: 'Склад', auth: true}
    },
    {
        path: '/leads',
        component: LeadsPanel,
        meta: {title: 'Заявки', auth: true}
    },
    {
        path: '/appointments',
        component: AppointmentPanel,
        meta: {title: 'Запись', auth: true}
    },

    {
        path: '/salary',
        component: SalaryPanel,
        meta: {title: 'Зарплата', auth: true}
    },
    {
        path: '/admin',
        component: AdminPanel,
        meta: {title: 'Администрация', auth: true}
    },
    {
        path: '*',
        redirect: '/login'
    }

]

export function createRouter() {
    const router = new VueRouter({
        routes
    })
    router.beforeEach((to, from, next) => {
        store.commit('SET_SCAN_MODE', {
            workdays: false,
            accesses: false,
            deals: false,
            expenses: false,
            leads: true
        })
        let currentIslandName = store.getters.workingIsland && store.getters.workingIsland.name || null
        document.title =  `${currentIslandName || 'Crmkin'} - ${to.meta.title}`
        let targetPage = to.path.substring(1)
        store.dispatch('setCurrentPage', targetPage)
        if (targetPage === 'daily') {
            store.commit('SET_SCAN_MODE', {... store.state.scanMode, workdays: true, expenses: true, deals: true})
        }
        next()
    })
    return router
}

