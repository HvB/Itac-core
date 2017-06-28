/**
 * Module de base pour le support du systeme de log.
 * 
 * @module
 * 
 * @requires bunyan
 * 
 * @author Stephane Talbot
 */
const bunyan = require('bunyan');
const level = require('../constant').log.level.itac;
var itacLogger = bunyan.createLogger({name: "ITAC", level: level});

module.exports={itacLogger}