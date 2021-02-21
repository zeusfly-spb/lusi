const dotenv = require('dotenv')
dotenv.config()
module.exports = {
    db_host: process.env.DB_HOST,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_name: process.env.DB_NAME,
    base_url: process.env.BASE_URL,
    redis_db: process.env.REDIS_DB,
    ws_port: process.env.WS_PORT
}
