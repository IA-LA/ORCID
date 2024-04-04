var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource'
      + '<script>console.log("Hola mundo.");</script>'
      + '<h2>Hola mundo</h2>');
});

module.exports = router;
