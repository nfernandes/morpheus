var express = require('express');
var controller = require('../controllers/api/emails');
var router = express.Router();
var isAuthenticated = require('../middleware/isAuthenticated');


/***************** READ ROUTES ******************************/

router.route('/')
    .get(isAuthenticated, controller.list)
    .post(isAuthenticated, controller.create);

router.route('/:emailid')
    .get(isAuthenticated, controller.details);

/***************** EXPORT ********************************/
module.exports = router;