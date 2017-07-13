var express = require('express');
var path = require('path');

var app = express();

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

app.use('/collab', express.static(path.join(__dirname, 'public')));
app.use('/collab', require('./route'));

module.exports = app;
