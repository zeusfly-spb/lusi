const redis = require('redis')
const CONFIG = require('./config')
const client = redis.createClient()
const db = CONFIG.redis_db
client.select(db)


const Set = (key, value) => new Promise((resolve, reject) => client.set(key, value, (err, res) => err ?
    reject(err) : resolve(res)))
const Get = key => new Promise((resolve, reject) => client.get(key, (err, res) => err ? reject(err) : resolve(res)))
const Has = key => new Promise((resolve, reject) => client.exists(key, (err, res) => err ? reject(err) : resolve(res)))
const Del = key => new Promise((resolve, reject) => client.del(key, (err, res) => err ? reject(err) : resolve(res)))

const command = (name, args = []) => {
    return new Promise ((resolve, reject) => {
        client[name](...args, (err, res) => err ? reject(err) : resolve(res))
    })
}

module.exports = {
    Get,
    Set,
    Has,
    Del,
    command
}
