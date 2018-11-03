'use strict'

var express = require('express');
var router = express.Router();
var controller = require('../controllers/api/version');

router.route('/')
    .get(controller.version);

/***************** EXPORT ****************/
module.exports = router;