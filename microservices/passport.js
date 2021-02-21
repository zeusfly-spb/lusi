const CONFIG = require('./config')
const axios = require('axios')
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.baseURL = CONFIG.base_url
const verifyToken = async (cookies) => {
    let isiToken = cookies.find(item => item.key === ' isi-token')
    let token = isiToken && isiToken.value || null
    if (!token) {
        return false
    }
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    try {
        await axios.post('/api/details')
    } catch (e) {
        return false
    }
    return true
}
exports.verifyToken = verifyToken


