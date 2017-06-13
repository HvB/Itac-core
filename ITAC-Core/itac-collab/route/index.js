var router = require('express').Router();
require('./configcollab')(router);
require('./collab')(router);
require('./configsession')(router);
require('./session')(router);
require('./workspace')(router);
module.exports = router;