const cache = require('../cache')

const index = async () => {
    try {
        let result = []
        const keys = await cache.command('keys', ['table:*'])
        let res = await cache.command('hgetall', ['table:1122334455'])
        return Promise.resolve(res)
    } catch (e) {
        return Promise.reject(new Error(`Failed get tables`))
    }
}

module.exports = {
    index
}
