var express = require('express');
var path = require('path');

var app = express();

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use('/domotique', function (req, res, next) {
    res.render('index', {title: 'ITAC'});
});

module.exports = app;