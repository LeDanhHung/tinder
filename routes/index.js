var express = require('express');
var app = express();
var router = express.Router();


router.get("/", function (req, res, next) {
  res.render('home');
});

app.get('/', function (request, response) {
  response.render('home');
});

module.exports = router;
