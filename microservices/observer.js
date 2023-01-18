const mysql = require('mysql')
const mySqlEvents = require('@rodrigogs/mysql-events')
const CONFIG = require('./config')
const performer = require('./performer')

const connection = mysql.createConnection({
    host: CONFIG.db_host,
    user: CONFIG.db_user,
    password: CONFIG.db_password
})

const program = async () => {
    const instance = new mySqlEvents(connection, {
        startAtEnd: true,
        excludedSchemas: {
            mysql: true
        }
    })
    await instance.start()
    instance.addTrigger({
        name: 'TEST',
        expression: '*',
        statement: mySqlEvents.STATEMENTS.ALL,
        onEvent: event => performer.inspect(event)
    })
    instance.on(mySqlEvents.EVENTS.CONNECTION_ERROR, console.error)
    instance.on(mySqlEvents.EVENTS.ZONGJI_ERROR, console.error)
}

program()
    .then(() => console.log('Waiting for database events'))
    .catch(console.error)
