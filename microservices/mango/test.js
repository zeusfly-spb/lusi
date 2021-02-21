const bridge = require('./bridge')
bridge.exec({path: '/config/users/request'}).then(console.log()).catch(console.error())
