const bunyan = require('bunyan');
const level = require('../constant').log.level.itac;
var itacLogger = bunyan.createLogger({name: "ITAC", level: level});

module.exports={itacLogger}