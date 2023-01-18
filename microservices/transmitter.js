const CONFIG = require('./config')
const passport = require('./passport')
const WebSocket = require('ws')
const wss = new WebSocket.Server({port: CONFIG.ws_port})
const router = require('./router')
const chalk = require('chalk')

const jsonSize = string => chalk.green.bold((Buffer.byteLength(string, 'utf8') / 1024).toFixed(2) + ' Kb.')

const frameType = frame => {
    let obj = JSON.parse(frame)
    if (obj.type === 'instruction' && obj.model.mutations && obj.model.mutations.length) {
        return chalk.red.bold(`Instruction ${obj.model.mutations.map(item => item.name).join(', ')}`)
    }
    return chalk.red.bold(obj.type)
}

const broadcast = data => {
    wss.clients.forEach(client => {
        client.readyState === WebSocket.OPEN ? client.send(data) : null
    })
}

const activeClients = () => {
    let result = []
    wss.clients.forEach(client => client.readyState === 1 ? result.push(client) : null)
    return result
}

const checkToInternalFunction = ({message, ws}) => {
    try {
        let frame = JSON.parse(message)
        let responseFrame
        switch (frame.type) {
            case 'request_get_active_clients':
                responseFrame = {
                    type: 'set_active_clients',
                    model: activeClients()
                }
                if (frame.request) {
                    responseFrame.response = {
                        id: frame.request.id
                    }
                }
                ws && ws.readyState === 1 ? ws.send(JSON.stringify(responseFrame)) : null
                break
            case 'close_active_sessions':
                console.log('Closing active sessions')
                let mutation = {name: 'AUTH_LOGOUT', data: null}
                responseFrame = {
                    type: 'instruction',
                    model: {
                        mutations: [mutation]
                    }
                }
                broadcast(JSON.stringify(responseFrame))
                break
            default: break
        }
    } catch (e) {
        throw Error('Ошибка выполнения внутренней инструкции сервера WebSocket: ', e)
    }
}

wss.on('connection', (ws, req) => {
    const parseCookie = str => {
        return {
            key: str.split('=')[0],
            value: str.split('=')[1]
        }
    }
    if (!req || !req.headers || !req.headers.cookie) {
        ws.send('Access denied')
        ws.close()
    } else {
        let cookies = req.headers.cookie.split(';')
        cookies = cookies.map(item => parseCookie(item))
        !passport.verifyToken(cookies) ? ws.close('401', 'Access denied') :
            console.log(chalk.green.bold.inverse('Connected from: '), chalk.bold.green(req.socket.remoteAddress))
    }

    ws.on('message', message => {
        console.log(chalk.green.bold('Received message =>'), chalk.cyan.bold(`${message}`))
        checkToInternalFunction({message, ws})
        router.parse(message)
            .then(res => {
                res.response ? console.log(chalk.blue.bold('Sending response'), frameType(res.response), jsonSize(res.response)) : null
                res.broadcast ? console.log(chalk.blue.bold('Sending broadcast'), frameType(res.broadcast), jsonSize(res.broadcast)) : null
                res.response ? ws.send(res.response) : null
                res.broadcast ? broadcast(res.broadcast) : null
            })
            .catch(e => console.error(e))
    })
})

module.exports = {
    broadcast
}
