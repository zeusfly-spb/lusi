const dotenv = require('dotenv')
dotenv.config()
const sha256 = require('sha256')
const axios = require('axios')

axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.baseURL = process.env.API_URL
axios.interceptors.request.use(request => {
    console.log('Starting Request', request)
    return request
})

const exec = async ({path, params = {}}) => {
    try {
        let json = JSON.stringify({ext_fields: params})
        let vpbx_api_key = process.env.API_KEY
        let sign = sha256(`${process.env.API_KEY}${json}${process.env.API_SALT}`)

        return Promise.resolve(await axios.post(path, {vpbx_api_key, sign, json}))
    } catch (e) {
        return Promise.reject(new Error(`Error sending mango command: ${e}`))
    }
}

module.exports = {
    exec
}
