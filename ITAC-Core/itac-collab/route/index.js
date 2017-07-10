var router = require('express').Router();
require('./collab')(router);
require('./config')(router);
require('./session')(router);
require('./workspace')(router);
module.exports = router;