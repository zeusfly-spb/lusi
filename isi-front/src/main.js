window.Cookies = require('js-cookie')
require('dotenv').config()

import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'

import {store} from './store'

import VueNativeSock from 'vue-native-websocket'
Vue.use(VueNativeSock, process.env.VUE_APP_WS_URL, {
    format: 'json',
    connectManually: true
})

import {createRouter} from './router'
const router = createRouter()

import VeeValidate from 'vee-validate';
import VeeValidate_RU from 'vee-validate/dist/locale/ru';
Vue.use(VeeValidate, {
    events: '',
    locale:     'ru',
    dictionary: {
        ru: VeeValidate_RU,
    },
});

import 'moment/locale/ru';
import moment from 'moment';
moment.locale('ru');
import VueMoment from 'vue-moment';
Vue.use(VueMoment, {
    moment,
});

import vBlur from 'v-blur'
Vue.use(vBlur)


import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

Vue.axios.defaults.headers.common['Accept'] = 'application/json'
Vue.axios.defaults.baseURL = process.env.VUE_APP_BASE_URL
Vue.config.productionTip = false

Vue.axios.interceptors.response.use(
    response => {
        return response;
    },
    function(error) {
        if (error.response && error.response.status === 401) {
            router.replace('/login');
        }
        return Promise.reject(error.response);
    }
)

store.commit('SET_BASE_PATH', process.env.VUE_APP_BASE_URL)
const token = Cookies.get('isi-token')
if (token) {
    Vue.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token

    setInterval(() => {
        let now = new Date()
        now.setMinutes(1 + now.getMinutes())
        Cookies.set('isi-token', token, {expires: now, path: '/'})
    }, 30000)

    store.dispatch('setAuthUser')
        .then(() => {
            if (!store.getters.isSuperadmin) {
                store.dispatch('checkAccess')
            }
        })

        .finally(() => {
            if (store.getters.isSuperadmin || store.getters.isAllowed) {
                store.dispatch('enterCRM')
            } else {
                router.push('/access')
            }
        })
} else {
    store.dispatch('logOut')
        .then(() => router.push('/login'))
}

// additional filter for pretty big number formats
Vue.filter('pretty', function (value) {
    if (!value) return '0'
    return value.toLocaleString('ru')
})

Vue.filter('phone', function (val) {
    String.prototype.replaceAt = function(index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    }
    if (!val) {
        return ''
    }
    return '+7 ' + val.replace(/[^0-9]/g, '')
        .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
        .replaceAt(6, '*')
        .replaceAt(7, '*')
        .replaceAt(8, '*')
})

Vue.filter('openPhone', function (val) {
    String.prototype.replaceAt = function(index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    }
    return '+7 ' + val.replace(/[^0-9]/g, '')
        .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
})

Vue.filter('upFirst', function (val) {
    return val ? val[0].toUpperCase() + val.substring(1) : ''
})

Vue.filter('externalPhone', function (val) {
    String.prototype.replaceAt = function(index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    }
    return val.replaceAt(9, '*').replaceAt(10, '*').replaceAt(11, '*')
})

Vue.filter('email', function(val) {
    if (!val) return ''
    String.prototype.replaceAt = function(index, replacement) {
        return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    }
    let name = val.split('@')[0]
    let domain = val.split('@')[1]
    if (name.length <= 3) {
        name = '***'
    } else {
        name = name.replaceAt(name.length, '*').replaceAt(name.length - 1, '*').replaceAt(name.length - 2, '*')
    }
    return name + '@' + domain
})

new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app')
