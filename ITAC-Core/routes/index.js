var express = require('express');
var router = express.Router();

/* retourne la page principale*/
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ITAC' });
});

module.exports = router;
