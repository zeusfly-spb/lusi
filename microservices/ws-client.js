const WebSocket = require('ws')
const connection = new WebSocket('ws://localhost:8118')

connection.onopen = () => {
    connection.send('token')
}

connection.onerror = (error) => {
    console.log(`WebSocket error: ${JSON.stringify(error)}`)
}

connection.onmessage = (e) => {
    console.log(e.data)
}
