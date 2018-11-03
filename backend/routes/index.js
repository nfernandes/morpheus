'use strict';

// group
var express = require('express');
var router = express.Router();
var response = require('../utils/response.js');

/********************* LOAD ROUTES ***********************/
router.get('/testing', function(req, res) {
    res.render('message', { user: req.user, db: true });
});


/**************************** MANAGE ****************************************/
router.use('/api/notifications', require('./notifications'));

/********************* MONITORING *************************/

router.use('/api/version', require('./version'));

/********************* Error handling for non existent apis *************************/
router.all('*', function(req, res) {
    response.sendError(res, 404);
})

/********************* TEST APIS ***********************/
router.get('/500', function(req, res, next) {
    var err = new Error('Internal Error');
    err.status = 500;
    next(err);
});

module.exports = router;