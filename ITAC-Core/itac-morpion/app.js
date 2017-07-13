var express = require('express');
var path = require('path');

var app = express();

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

app.use('/morpion', express.static(path.join(__dirname, 'public')));
app.use('/morpion', function (req, res, next) {
    res.render('index', {title: 'ITAC'});
});

module.exports = app;