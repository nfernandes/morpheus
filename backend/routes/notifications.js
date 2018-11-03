var express = require('express');
var controller = require('../controllers/api/notifications');
var router = express.Router();
var isAuthenticated = require('../middleware/isAuthenticated');


/***************** READ ROUTES ******************************/

router.route('/')
    .get( /*isAuthenticated*/ controller.list)
    .post( /*isAuthenticated,*/ controller.create);

/***************** EXPORT ********************************/
module.exports = router;